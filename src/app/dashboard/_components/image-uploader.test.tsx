import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from './image-uploader';

// Type for mocked fetch
type MockedFetch = ReturnType<typeof vi.fn>;

// Mock fetch globally
global.fetch = vi.fn() as MockedFetch;

describe('ImageUploader', () => {
  const mockOnImageUploaded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as MockedFetch).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with default placeholder', () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      expect(screen.getByText(/画像ファイルをドラッグ&ドロップ/)).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(
        <ImageUploader
          onImageUploaded={mockOnImageUploaded}
          placeholder="カスタムプレースホルダー"
        />
      );
      expect(screen.getByText('カスタムプレースホルダー')).toBeInTheDocument();
    });

    it('should render file selection button', () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
    });

    it('should render file requirements text', () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      expect(screen.getByText(/JPEG\/PNG形式、10MB以下、1024x1024px以上/)).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should open file picker when clicking the button', () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const button = screen.getByText('ファイルを選択');
      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]');

      const clickSpy = vi.spyOn(input as HTMLInputElement, 'click');
      fireEvent.click(button);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should open file picker when clicking the drop area', () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const dropArea = screen.getByRole('button', { name: '画像をアップロード' });
      const input = dropArea.querySelector('input[type="file"]');

      const clickSpy = vi.spyOn(input as HTMLInputElement, 'click');
      fireEvent.click(dropArea);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle file selection and upload successfully', async () => {
      // Mock successful upload response
      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secure_url: 'https://example.com/image.jpg',
          public_id: 'test-id',
          width: 1024,
          height: 1024,
        }),
      });

      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);

      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]') as HTMLInputElement;

      // Create a valid image file
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      // Mock Image constructor to simulate valid dimensions
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        width = 1024;
        height = 1024;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      fireEvent.change(input, { target: { files: [file] } });

      // Wait for upload to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/uploads/image',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
      });

      await waitFor(() => {
        expect(mockOnImageUploaded).toHaveBeenCalledWith('https://example.com/image.jpg');
      });

      // Restore original Image
      global.Image = originalImage;
    });
  });

  describe('Drag and Drop', () => {
    it('should show drag state when dragging over', () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const dropArea = screen.getByRole('button', { name: '画像をアップロード' });

      fireEvent.dragOver(dropArea);

      expect(dropArea).toHaveClass('border-blue-500');
    });

    it('should remove drag state when dragging leaves', () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const dropArea = screen.getByRole('button', { name: '画像をアップロード' });

      fireEvent.dragOver(dropArea);
      expect(dropArea).toHaveClass('border-blue-500');

      fireEvent.dragLeave(dropArea);
      expect(dropArea).not.toHaveClass('border-blue-500');
    });

    it('should handle file drop successfully', async () => {
      // Mock successful upload response
      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secure_url: 'https://example.com/dropped.jpg',
          public_id: 'test-id',
          width: 2048,
          height: 2048,
        }),
      });

      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const dropArea = screen.getByRole('button', { name: '画像をアップロード' });

      const file = new File(['dummy content'], 'dropped.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB

      // Mock Image for dimension validation
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        width = 2048;
        height = 2048;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnImageUploaded).toHaveBeenCalledWith('https://example.com/dropped.jpg');
      });

      // Restore original Image
      global.Image = originalImage;
    });
  });

  describe('Validation', () => {
    it('should show error for invalid file type', async () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('JPEG または PNG 形式の画像ファイルを選択してください')).toBeInTheDocument();
      });

      expect(mockOnImageUploaded).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should show error for file size exceeding limit', async () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['dummy content'], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/ファイルサイズは 10MB 以下にしてください/)).toBeInTheDocument();
      });

      expect(mockOnImageUploaded).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should show error for image dimensions below minimum', async () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['dummy content'], 'small.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      // Mock Image with small dimensions
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        width = 512;
        height = 512;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/画像のサイズは 1024x1024px 以上にしてください/)).toBeInTheDocument();
      });

      expect(mockOnImageUploaded).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();

      // Restore original Image
      global.Image = originalImage;
    });

    it('should clear error when clicking the close button', async () => {
      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('JPEG または PNG 形式の画像ファイルを選択してください')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('エラーを閉じる');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('JPEG または PNG 形式の画像ファイルを選択してください')).not.toBeInTheDocument();
      });
    });
  });

  describe('Upload Progress', () => {
    it('should show upload progress during upload', async () => {
      // Mock upload with delay
      (global.fetch as MockedFetch).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    secure_url: 'https://example.com/image.jpg',
                    public_id: 'test-id',
                    width: 1024,
                    height: 1024,
                  }),
                }),
              200
            )
          )
      );

      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      // Mock Image
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        width = 1024;
        height = 1024;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      fireEvent.change(input, { target: { files: [file] } });

      // Check for progress indicator
      await waitFor(() => {
        expect(screen.getByText(/アップロード中\.\.\./)).toBeInTheDocument();
      });

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('アップロード完了')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Restore original Image
      global.Image = originalImage;
    });
  });

  describe('Error Handling', () => {
    it('should show error when upload fails', async () => {
      // Mock failed upload response
      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Cloudinary 未設定（CLOUDINARY_*）',
        }),
      });

      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      // Mock Image
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        width = 1024;
        height = 1024;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('Cloudinary 未設定（CLOUDINARY_*）')).toBeInTheDocument();
      });

      expect(mockOnImageUploaded).not.toHaveBeenCalled();

      // Restore original Image
      global.Image = originalImage;
    });

    it('should show error when network request fails', async () => {
      // Mock network error
      (global.fetch as MockedFetch).mockRejectedValueOnce(new Error('Network error'));

      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const input = screen.getByLabelText('画像をアップロード').querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      // Mock Image
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        width = 1024;
        height = 1024;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      expect(mockOnImageUploaded).not.toHaveBeenCalled();

      // Restore original Image
      global.Image = originalImage;
    });
  });

  describe('Clipboard Paste', () => {
    it('should handle paste event with image', async () => {
      // Mock successful upload response
      (global.fetch as MockedFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secure_url: 'https://example.com/pasted.jpg',
          public_id: 'test-id',
          width: 1024,
          height: 1024,
        }),
      });

      render(<ImageUploader onImageUploaded={mockOnImageUploaded} />);
      const dropArea = screen.getByRole('button', { name: '画像をアップロード' });

      const file = new File(['dummy content'], 'pasted.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      // Mock Image
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        width = 1024;
        height = 1024;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      fireEvent.paste(dropArea, {
        clipboardData: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnImageUploaded).toHaveBeenCalledWith('https://example.com/pasted.jpg');
      });

      // Restore original Image
      global.Image = originalImage;
    });
  });
});
