export type UploadCommand = {
  file: File;
  folder: string;
  resize?: {
    width: number;
    height: number;
  };
};

export type UploadResult = {
  url: string;
};

export interface UploadService {
  upload(command: UploadCommand): Promise<UploadResult>;
}
