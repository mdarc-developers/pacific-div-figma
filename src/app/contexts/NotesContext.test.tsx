import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotesProvider, useNotesContext } from "@/app/contexts/NotesContext";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";

// ── Helper to wrap with required providers ─────────────────────────────────────
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConferenceProvider>
      <NotesProvider>{children}</NotesProvider>
    </ConferenceProvider>
  );
}

// ── Test component that exercises the context ─────────────────────────────────
function NotesTester({ sessionId }: { sessionId: string }) {
  const { notes, setNote, deleteNote } = useNotesContext();
  return (
    <div>
      <span data-testid="note-text">{notes[sessionId] ?? ""}</span>
      <button onClick={() => setNote(sessionId, "My test note")}>set</button>
      <button onClick={() => setNote(sessionId, "  ")}>set-blank</button>
      <button onClick={() => deleteNote(sessionId)}>delete</button>
    </div>
  );
}

describe("NotesContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders without crashing inside a provider", () => {
    expect(() =>
      render(
        <Wrapper>
          <NotesTester sessionId="s1" />
        </Wrapper>,
      ),
    ).not.toThrow();
  });

  it("starts with empty notes", () => {
    render(
      <Wrapper>
        <NotesTester sessionId="s1" />
      </Wrapper>,
    );
    expect(screen.getByTestId("note-text").textContent).toBe("");
  });

  it("sets a note and reflects it in state", () => {
    render(
      <Wrapper>
        <NotesTester sessionId="s1" />
      </Wrapper>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set" }));
    expect(screen.getByTestId("note-text").textContent).toBe("My test note");
  });

  it("removes a note when text is blank (whitespace-only)", () => {
    render(
      <Wrapper>
        <NotesTester sessionId="s1" />
      </Wrapper>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set" }));
    expect(screen.getByTestId("note-text").textContent).toBe("My test note");

    fireEvent.click(screen.getByRole("button", { name: "set-blank" }));
    expect(screen.getByTestId("note-text").textContent).toBe("");
  });

  it("deletes a note with deleteNote", () => {
    render(
      <Wrapper>
        <NotesTester sessionId="s1" />
      </Wrapper>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set" }));
    expect(screen.getByTestId("note-text").textContent).toBe("My test note");

    fireEvent.click(screen.getByRole("button", { name: "delete" }));
    expect(screen.getByTestId("note-text").textContent).toBe("");
  });

  it("persists notes to localStorage", () => {
    render(
      <Wrapper>
        <NotesTester sessionId="s1" />
      </Wrapper>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set" }));
    // The key is prefixed with "notes_" + conferenceId
    const storedKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith("notes_"),
    );
    expect(storedKeys.length).toBeGreaterThan(0);
    const stored = JSON.parse(localStorage.getItem(storedKeys[0])!);
    expect(stored["s1"]).toBe("My test note");
  });

  it("throws if used outside a NotesProvider", () => {
    // Suppress the expected error output in test console
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    function BadConsumer() {
      useNotesContext();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      /useNotesContext must be used within a NotesProvider/,
    );

    consoleSpy.mockRestore();
  });
});
