import { ClickHouseClient } from '@clickhouse/client';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ClickHouseService {
  constructor(
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickHouseClient: ClickHouseClient,
    private readonly loggerService: LoggerService,
  ) {}

  async runQuery<T>(
    query: string,
    params: Record<string, any> = {},
  ): Promise<T[]> {
    const maxRetries = 3;
    const retryDelay = 500;
    const timeoutDuration = 60000;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const executeQuery = async () => {
          const start = Date.now();
          let result;

          if (
            query.trim().includes('DELETE') ||
            query.trim().includes('UPDATE')
          ) {
            await this.clickHouseClient.query({
              query: query,
            });
            result = [] as T[];
          } else {
            const clickhouseResult = await this.clickHouseClient.query({
              query,
              query_params: params,
              format: 'JSONEachRow',
            });

            const jsonResult: unknown[] = await clickhouseResult.json();
            result = jsonResult as T[];
          }

          const duration = Date.now() - start;
          this.loggerService.info(`Query executed in ${duration}ms: ${query}`);
          return result;
        };

        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Query timed out')),
            timeoutDuration,
          ),
        );

        const result = await Promise.race([executeQuery(), timeoutPromise]);
        return result;
      } catch (error) {
        if (error.message.includes('socket hang up')) {
          this.loggerService.warn(
            `Socket hang up error. Retrying... (${i + 1}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          this.loggerService.error(
            `Error executing query: ${error.message}`,
            error,
          );
          throw new Error(`ClickHouse query failed: ${error.message}`);
        }
      }
    }

    this.loggerService.error('Failed to execute query after multiple retries');
    throw new Error('Failed to execute query after multiple retries');
  }

  async runInsertQuery<T>(params: any): Promise<void> {
    const maxRetries = 3;
    const retryDelay = 500; // 500ms
    const timeout = 30000; // 30 seconds

    for (let i = 0; i <= maxRetries; i++) {
      try {
        this.loggerService.info(
          `Attempting to insert data (Attempt ${i + 1}/${maxRetries})`,
        );

        // Perform the insert operation with the specified parameters
        await this.clickHouseClient.insert({
          ...params,
          timeout,
        });

        this.loggerService.info('Data insert successful');
        return;
      } catch (error) {
        if (error.message.includes('socket hang up')) {
          this.loggerService.warn(
            `Socket hang up error. Retrying... (${i + 1}/${maxRetries})`,
          );
          // Retry after a short delay
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          this.loggerService.error(
            `Error during insert query: ${error.message}`,
            error,
          );
          throw new Error(`ClickHouse insert query failed: ${error.message}`);
        }
      }
    }

    this.loggerService.error('Failed to insert data after multiple retries');
    // If all retries fail, throw an error
    throw new Error('Failed to insert data after multiple retries');
  }

  // Get all records with pagination and filtering by date
  async getAll<T>(
    tableName: string,
    startDate?: number,
    endDate?: number,
    page?: number,
    limit?: number,
    sortField: string = 'timestamp',
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    projection?: string[],
  ): Promise<T[]> {
    const selectedColumns =
      projection && projection.length > 0 ? projection.join(', ') : '*';

    let query = `SELECT ${selectedColumns} FROM ${tableName}`;
    if (startDate && endDate) {
      query += `
      WHERE timestamp BETWEEN ${startDate} AND ${endDate}
    `;
    }

    query += ` ORDER BY ${sortField} ${sortOrder}`;
    if (page && limit) {
      const offset = (page - 1) * limit;
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    this.loggerService.info(`Executing query: ${query}`);

    try {
      const result = await this.runQuery(query);
      this.loggerService.info('Query executed successfully');
      return result as T[];
    } catch (error) {
      this.loggerService.error(`Error executing query: ${query}`, error);
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  }

  // Get a single record by ID
  async getById<T>(tableName: string, id: number): Promise<T | null> {
    const query = `SELECT * FROM ${tableName} WHERE id = ${id}`;
    this.loggerService.info(`Executing query to get by ID: ${query}`);

    try {
      const result = await this.runQuery<T>(query);
      this.loggerService.info(`Query executed successfully for ID: ${id}`);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.loggerService.error(`Error executing query for ID: ${id}`, error);
      throw new Error(`Failed to fetch record by ID: ${error.message}`);
    }
  }

  async getByCondition<T>(
    tableName: string,
    conditions: Record<string, any>,
  ): Promise<T[] | null> {
    const whereClause = Object.entries(conditions)
      .map(([key, value]) => {
        const formattedValue = typeof value === 'string' ? `'${value}'` : value;
        return `${key} = ${formattedValue}`;
      })
      .join(' AND ');

    const query = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
    this.loggerService.info(`Executing query with conditions: ${query}`);

    try {
      const result = await this.runQuery<T>(query);
      this.loggerService.info(`Query executed successfully with conditions`);
      return result.length > 0 ? result : null;
    } catch (error) {
      this.loggerService.error(
        `Error executing query with conditions: ${whereClause}`,
        error,
      );
      throw new Error(
        `Failed to fetch records by conditions: ${error.message}`,
      );
    }
  }

  async create<T>(tableName: string, data: T): Promise<void> {
    const insertParams = {
      table: tableName,
      values: [data],
      format: 'JSONEachRow' as const,
    };

    this.loggerService.info(
      `Inserting data into ${tableName}: ${JSON.stringify(data)}`,
    );

    try {
      await this.runInsertQuery(insertParams);
      this.loggerService.info(`Data inserted successfully into ${tableName}`);
    } catch (error) {
      this.loggerService.error(`Error inserting data into ${tableName}`, error);
      throw new Error(
        `Failed to insert data into ${tableName}: ${error.message}`,
      );
    }
  }

  // Update a record by ID
  async update<T>(
    tableName: string,
    id: number,
    updates: Partial<T>,
  ): Promise<void> {
    const setClauses = Object.entries(updates)
      .map(
        ([key, value]) =>
          `${key} = ${typeof value === 'string' ? `'${value}'` : value}`,
      )
      .join(', ');

    const query = `
      ALTER TABLE ${tableName}
      UPDATE ${setClauses}
      WHERE id = ${id}
    `;

    this.loggerService.info(
      `Updating record in ${tableName} with id: ${id}. Updates: ${JSON.stringify(updates)}`,
    );

    try {
      await this.runQuery(query);
      this.loggerService.info(
        `Record with id ${id} updated successfully in ${tableName}`,
      );
    } catch (error) {
      this.loggerService.error(
        `Error updating record with id ${id} in ${tableName}`,
        error,
      );
      throw new Error(
        `Failed to update record with id ${id} in ${tableName}: ${error.message}`,
      );
    }
  }

  async updateByCondition<T>(
    tableName: string,
    conditions: Record<string, any>,
    updates: Partial<T>,
  ): Promise<boolean> {
    const setClauses = Object.entries(updates)
      .map(
        ([key, value]) =>
          `${key} = ${typeof value === 'string' ? `'${value}'` : value}`,
      )
      .join(', ');

    // Construct where clause for conditions
    const whereClause = Object.entries(conditions)
      .map(([key, value]) => {
        const formattedValue = typeof value === 'string' ? `'${value}'` : value;
        return `${key} = ${formattedValue}`;
      })
      .join(' AND ');

    // Prepare the complete query
    const query = `
      ALTER TABLE ${tableName}
      UPDATE ${setClauses}
      WHERE ${whereClause}
    `;

    this.loggerService.info(
      `Updating records in ${tableName} with conditions: ${JSON.stringify(conditions)}. Updates: ${JSON.stringify(updates)}`,
    );

    try {
      await this.runQuery(query);
      this.loggerService.info(
        `Records updated successfully in ${tableName} with conditions: ${JSON.stringify(conditions)}`,
      );
      return true;
    } catch (error) {
      this.loggerService.error(
        `Error updating records in ${tableName} with conditions: ${JSON.stringify(conditions)}`,
        error,
      );
      return false;
    }
  }

  // Delete a record by ID
  async delete(tableName: string, id: string | number): Promise<boolean> {
    const query = `
    ALTER TABLE ${tableName}
    DELETE WHERE id = ${id}
  `;

    this.loggerService.info(`Deleting record from ${tableName} with id: ${id}`);

    try {
      await this.runQuery(query);
      this.loggerService.info(
        `Record with id ${id} deleted successfully from ${tableName}`,
      );
      return true;
    } catch (error) {
      this.loggerService.error(
        `Error deleting record with id ${id} from ${tableName}`,
        error,
      );
      return false;
    }
  }

  async deleteByEntityId(
    tableName: string,
    entityId: string,
  ): Promise<boolean> {
    const query = `
      ALTER TABLE ${tableName}
      DELETE WHERE entity_id='${entityId}'
    `;

    this.loggerService.info(
      `Attempting to delete record from ${tableName} with entity_id: ${entityId}`,
    );

    try {
      await this.runQuery(query);
      this.loggerService.info(
        `Successfully deleted record from ${tableName} with entity_id: ${entityId}`,
      );
      return true;
    } catch (error) {
      this.loggerService.error(
        `Error deleting record from ${tableName} with entity_id: ${entityId}`,
        error,
      );
      return false;
    }
  }
}
