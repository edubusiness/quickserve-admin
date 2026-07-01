import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DataTable, type Column } from "./data-table";

interface Row {
  id: string;
  name: string;
  score: number;
}

const rows: Row[] = [
  { id: "1", name: "Charlie", score: 30 },
  { id: "2", name: "Alice", score: 10 },
  { id: "3", name: "Bob", score: 20 },
  { id: "4", name: "Dave", score: 40 },
];

const columns: Column<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "score", header: "Score", sortable: true, align: "right" },
];

const setup = (extra: Record<string, unknown> = {}) =>
  render(
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(r: Row) => r.id}
      searchKeys={["name"]}
      pageSize={2}
      {...extra}
    />,
  );

describe("DataTable", () => {
  it("renders only the first page of rows", () => {
    setup();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    expect(screen.getByText(/of/)).toHaveTextContent("4");
  });

  it("filters via search", () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "dave" } });
    expect(screen.getByText("Dave")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("sorts ascending then descending on header click", () => {
    setup();
    const sortBtn = screen.getByRole("button", { name: /Name/ });
    fireEvent.click(sortBtn); // asc: Alice, Bob
    let cells = screen.getAllByRole("cell").map((c) => c.textContent);
    expect(cells).toContain("Alice");
    expect(cells).toContain("Bob");
    fireEvent.click(sortBtn); // desc: Dave, Charlie
    cells = screen.getAllByRole("cell").map((c) => c.textContent);
    expect(cells).toContain("Dave");
  });

  it("navigates pages", () => {
    setup();
    fireEvent.click(screen.getByText("2"));
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("selects rows and fires bulk actions", () => {
    const onClick = vi.fn();
    setup({ bulkActions: [{ label: "Archive", onClick }] });
    // first checkbox is the select-all header
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    expect(screen.getByText(/selected/)).toHaveTextContent("1 selected");
    fireEvent.click(screen.getByText("Archive"));
    expect(onClick).toHaveBeenCalledWith(["1"]);
  });

  it("shows an empty state when search matches nothing", () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "zzz" } });
    expect(screen.getByText(/No results found/)).toBeInTheDocument();
  });
});
