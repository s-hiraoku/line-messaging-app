import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationForm } from "./card-form-location";
import type { LocationCard } from "./types";

// Mock ImageUploader component
vi.mock("@/app/dashboard/_components/image-uploader", () => ({
  ImageUploader: ({
    onImageUploaded,
    placeholder,
  }: {
    onImageUploaded: (url: string) => void;
    placeholder?: string;
  }) => (
    <div data-testid="image-uploader">
      <p>{placeholder}</p>
      <button
        type="button"
        onClick={() => onImageUploaded("https://example.com/test-image.jpg")}
      >
        Upload Image
      </button>
    </div>
  ),
}));

// Mock ActionEditor component
vi.mock("./action-editor", () => ({
  ActionEditor: ({
    actions,
    onChange,
    maxActions,
  }: {
    actions: LocationCard["actions"];
    onChange: (actions: LocationCard["actions"]) => void;
    maxActions?: number;
  }) => (
    <div data-testid="action-editor">
      <p>Actions: {actions.length}</p>
      <p>Max: {maxActions}</p>
      <button
        type="button"
        onClick={() =>
          onChange([
            {
              type: "uri",
              label: "Visit",
              uri: "https://example.com",
            },
          ])
        }
      >
        Add Action
      </button>
    </div>
  ),
}));

describe("LocationForm", () => {
  const mockCard: LocationCard = {
    id: "test-location-1",
    type: "location",
    title: "Tokyo Tower",
    address: "Tokyo, Minato City, Shibakoen, 4 Chome-2-8",
    hours: "9:00-23:00",
    imageUrl: "https://example.com/tokyo-tower.jpg",
    actions: [
      {
        type: "uri",
        label: "Visit Website",
        uri: "https://www.tokyotower.co.jp/",
      },
    ],
  };

  const mockOnChange = vi.fn();

  it("renders all form fields correctly", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
    expect(screen.getByLabelText(/住所/)).toBeInTheDocument();
    expect(screen.getByLabelText(/営業時間/)).toBeInTheDocument();
    expect(screen.getByTestId("image-uploader")).toBeInTheDocument();
    expect(screen.getByTestId("action-editor")).toBeInTheDocument();
  });

  it("displays current card values in form fields", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/タイトル/)).toHaveValue("Tokyo Tower");
    expect(screen.getByLabelText(/住所/)).toHaveValue(
      "Tokyo, Minato City, Shibakoen, 4 Chome-2-8"
    );
    expect(screen.getByLabelText(/営業時間/)).toHaveValue("9:00-23:00");
  });

  it("calls onChange when title is updated", async () => {
    const user = userEvent.setup();
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText(/タイトル/);
    await user.clear(titleInput);
    await user.type(titleInput, "Test");

    // user.type calls onChange for each character, check the last call
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0]).toEqual({ title: "Tokyo Towert" });
  });

  it("calls onChange when address is updated", async () => {
    const user = userEvent.setup();
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    const addressInput = screen.getByLabelText(/住所/);
    await user.clear(addressInput);
    await user.type(addressInput, "Test");

    // user.type calls onChange for each character, check the last call
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0]).toEqual({ address: "Tokyo, Minato City, Shibakoen, 4 Chome-2-8t" });
  });

  it("calls onChange when hours is updated", async () => {
    const user = userEvent.setup();
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    const hoursInput = screen.getByLabelText(/営業時間/);
    await user.clear(hoursInput);
    await user.type(hoursInput, "Test");

    // user.type calls onChange for each character, check the last call
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0]).toEqual({ hours: "9:00-23:00t" });
  });

  it("displays character count for title field", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByText("11/40文字")).toBeInTheDocument();
  });

  it("displays character count for address field", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByText("42/60文字")).toBeInTheDocument();
  });

  it("displays character count for hours field", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByText("10/60文字")).toBeInTheDocument();
  });

  it("shows validation error when title is empty after blur", async () => {
    const user = userEvent.setup();
    const emptyCard: LocationCard = {
      ...mockCard,
      title: "",
    };

    render(<LocationForm card={emptyCard} onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText(/タイトル/);
    await user.click(titleInput);
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
    });
  });

  it("shows validation error when address is empty after blur", async () => {
    const user = userEvent.setup();
    const emptyCard: LocationCard = {
      ...mockCard,
      address: "",
    };

    render(<LocationForm card={emptyCard} onChange={mockOnChange} />);

    const addressInput = screen.getByLabelText(/住所/);
    await user.click(addressInput);
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByText("住所は必須です")).toBeInTheDocument();
    });
  });

  it("shows warning when title approaches character limit", () => {
    const longTitleCard: LocationCard = {
      ...mockCard,
      title: "A".repeat(36), // 36 chars, close to 40 limit
    };

    render(<LocationForm card={longTitleCard} onChange={mockOnChange} />);

    expect(screen.getByText("文字数制限に近づいています")).toBeInTheDocument();
  });

  it("shows error when title reaches character limit", () => {
    const maxTitleCard: LocationCard = {
      ...mockCard,
      title: "A".repeat(40), // Exactly 40 chars
    };

    render(<LocationForm card={maxTitleCard} onChange={mockOnChange} />);

    expect(screen.getByText("文字数制限に達しました")).toBeInTheDocument();
  });

  it("calls onChange when image is uploaded", async () => {
    const user = userEvent.setup();
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    const uploadButton = screen.getByRole("button", { name: "Upload Image" });
    await user.click(uploadButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      imageUrl: "https://example.com/test-image.jpg",
    });
  });

  it("calls onChange when actions are updated", async () => {
    const user = userEvent.setup();
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    const addActionButton = screen.getByRole("button", { name: "Add Action" });
    await user.click(addActionButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      actions: [
        {
          type: "uri",
          label: "Visit",
          uri: "https://example.com",
        },
      ],
    });
  });

  it("displays current image preview when imageUrl is set", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByText("現在の画像:")).toBeInTheDocument();
    expect(screen.getByAltText("Tokyo Tower")).toBeInTheDocument();
    expect(
      screen.getByText("https://example.com/tokyo-tower.jpg")
    ).toBeInTheDocument();
  });

  it("displays form summary with completion status", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByText("入力状況")).toBeInTheDocument();
    // All fields should show checkmark (✓) as mockCard has all required fields
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  it("displays validation summary when there are errors", async () => {
    const user = userEvent.setup();
    const invalidCard: LocationCard = {
      ...mockCard,
      title: "",
      address: "",
      imageUrl: "",
      actions: [],
    };

    render(<LocationForm card={invalidCard} onChange={mockOnChange} />);

    // Trigger blur on fields to show errors
    const titleInput = screen.getByLabelText(/タイトル/);
    const addressInput = screen.getByLabelText(/住所/);

    await user.click(titleInput);
    await user.tab();
    await user.click(addressInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/入力エラー/)).toBeInTheDocument();
    });
  });

  it("accepts optional hours field with empty value", () => {
    const noHoursCard: LocationCard = {
      ...mockCard,
      hours: undefined,
    };

    render(<LocationForm card={noHoursCard} onChange={mockOnChange} />);

    const hoursInput = screen.getByLabelText(/営業時間/);
    expect(hoursInput).toHaveValue("");
    expect(screen.getByText("0/60文字")).toBeInTheDocument();
  });

  it("enforces maxLength on title input", async () => {
    const user = userEvent.setup();
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText(/タイトル/) as HTMLInputElement;
    expect(titleInput.maxLength).toBe(40);
  });

  it("enforces maxLength on address input", async () => {
    const user = userEvent.setup();
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    const addressInput = screen.getByLabelText(/住所/) as HTMLInputElement;
    expect(addressInput.maxLength).toBe(60);
  });

  it("enforces maxLength on hours input", async () => {
    const user = userEvent.setup();
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    const hoursInput = screen.getByLabelText(/営業時間/) as HTMLInputElement;
    expect(hoursInput.maxLength).toBe(60);
  });

  it("displays action count in summary", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByText("✓ (1/3)")).toBeInTheDocument();
  });

  it("passes maxActions prop to ActionEditor", () => {
    render(<LocationForm card={mockCard} onChange={mockOnChange} />);

    expect(screen.getByText("Max: 3")).toBeInTheDocument();
  });
});
