import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/auth-context";

// Mock the Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

// Test component that uses the auth hook
function TestAuthConsumer() {
  const { user, loading, signInWithMagicLink, signOut } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "ready"}</div>
      <div data-testid="user">{user ? user.email : "no user"}</div>
      <button onClick={() => signInWithMagicLink("test@sas.edu.sg")}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws error when useAuth is used outside AuthProvider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestAuthConsumer />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  it("provides auth context to children", async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
  });

  it("starts in loading state", () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    // Initially should be loading
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
  });

  it("shows no user when not authenticated", async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("no user");
    });
  });
});

describe("useAuth hook", () => {
  it("returns all required properties", async () => {
    const authValuesRef = { current: null as ReturnType<typeof useAuth> | null };

    function CaptureAuth() {
      const auth = useAuth();
      // Store in ref object for test verification
      authValuesRef.current = auth;
      return null;
    }

    render(
      <AuthProvider>
        <CaptureAuth />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authValuesRef.current).not.toBeNull();
    });

    expect(authValuesRef.current).toHaveProperty("user");
    expect(authValuesRef.current).toHaveProperty("session");
    expect(authValuesRef.current).toHaveProperty("loading");
    expect(authValuesRef.current).toHaveProperty("signInWithMagicLink");
    expect(authValuesRef.current).toHaveProperty("signInWithPassword");
    expect(authValuesRef.current).toHaveProperty("signInWithGoogle");
    expect(authValuesRef.current).toHaveProperty("signUp");
    expect(authValuesRef.current).toHaveProperty("resetPassword");
    expect(authValuesRef.current).toHaveProperty("updatePassword");
    expect(authValuesRef.current).toHaveProperty("signOut");
    expect(typeof authValuesRef.current!.signInWithMagicLink).toBe("function");
    expect(typeof authValuesRef.current!.signInWithPassword).toBe("function");
    expect(typeof authValuesRef.current!.signInWithGoogle).toBe("function");
    expect(typeof authValuesRef.current!.signUp).toBe("function");
    expect(typeof authValuesRef.current!.resetPassword).toBe("function");
    expect(typeof authValuesRef.current!.updatePassword).toBe("function");
    expect(typeof authValuesRef.current!.signOut).toBe("function");
  });
});

describe("Email Validation", () => {
  it("validates SAS email domain", () => {
    const isValidSasEmail = (email: string): boolean => {
      return email.endsWith("@sas.edu.sg");
    };

    expect(isValidSasEmail("user@sas.edu.sg")).toBe(true);
    expect(isValidSasEmail("user@gmail.com")).toBe(false);
    expect(isValidSasEmail("user@sas.edu")).toBe(false);
    expect(isValidSasEmail("@sas.edu.sg")).toBe(true); // Just domain check
    expect(isValidSasEmail("user@SAS.edu.sg")).toBe(false); // Case sensitive
  });

  it("validates case-insensitive SAS email domain", () => {
    const isValidSasEmail = (email: string): boolean => {
      return email.toLowerCase().endsWith("@sas.edu.sg");
    };

    expect(isValidSasEmail("user@sas.edu.sg")).toBe(true);
    expect(isValidSasEmail("user@SAS.EDU.SG")).toBe(true);
    expect(isValidSasEmail("user@Sas.Edu.Sg")).toBe(true);
    expect(isValidSasEmail("user@gmail.com")).toBe(false);
  });
});

describe("User Initials", () => {
  // Test the initials logic from app-sidebar
  function getUserInitials(email: string | undefined): string {
    if (!email) return "?";
    const name = email.split("@")[0];
    const parts = name.split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  it("returns ? for undefined email", () => {
    expect(getUserInitials(undefined)).toBe("?");
  });

  it("returns initials from first.last format", () => {
    expect(getUserInitials("john.doe@sas.edu.sg")).toBe("JD");
  });

  it("returns first two chars for single name", () => {
    expect(getUserInitials("admin@sas.edu.sg")).toBe("AD");
  });

  it("handles lowercase names", () => {
    expect(getUserInitials("jane.smith@sas.edu.sg")).toBe("JS");
  });

  it("handles complex names with dots", () => {
    expect(getUserInitials("mary.jane.watson@sas.edu.sg")).toBe("MJ");
  });

  it("handles short usernames", () => {
    expect(getUserInitials("a@sas.edu.sg")).toBe("A");
  });
});
