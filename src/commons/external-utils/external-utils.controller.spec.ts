import { S3UploadService } from '../storage/aws-s3-upload.service';
import { ExternalUtilsController } from './external-utils.controller';
import { ExternalUtilsService } from './external-utils.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('ExternalUtilsController', () => {
  let externalUtilsController: ExternalUtilsController;
  let eslintxternalUtilsService: ExternalUtilsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalUtilsController],
      providers: [
        ExternalUtilsService,
        {
          provide: S3UploadService,
          useFactory: () => ({
            uploadS3: jest.fn(),
          }),
        },
      ],
    }).compile();

    externalUtilsController = module.get<ExternalUtilsController>(
      ExternalUtilsController,
    );
    eslintxternalUtilsService =
      module.get<ExternalUtilsService>(ExternalUtilsService);
  });

  const createMockFile = (
    fieldName: string,
    originalname: string,
    mimetype: string,
    buffer: Buffer,
  ): Express.Multer.File => {
    return {
      fieldname: fieldName,
      originalname: originalname,
      encoding: '7bit',
      mimetype: mimetype,
      buffer: buffer,
      size: buffer.length,
      destination: 'mock-destination',
      filename: 'mock-filename',
      path: 'mock-path',
      stream: null as any,
    };
  };

  describe('uploadFile', () => {
    it('should upload a valid file successfully', async () => {
      const file = createMockFile(
        'file',
        'example.jpg',
        'image/jpeg',
        Buffer.from('mockImageData'),
      );
      jest
        .spyOn(eslintxternalUtilsService, 'fileUpload')
        .mockResolvedValue('File uploaded successfully');

      const result = await externalUtilsController.uploadFile(file, '1');
      const params: object = {
        userId: '1',
        attribute: 'profile_image',
        mime: 'image',
      };
      expect(eslintxternalUtilsService.fileUpload).toHaveBeenCalledWith(
        file,
        params,
      );
      expect(result).toEqual('File uploaded successfully');
    });
  });
});
