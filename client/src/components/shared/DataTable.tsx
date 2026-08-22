import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  searchKeys?: string[];
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  toolbar?: ReactNode;
};

function getValue(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "yes" : "no";
  return String(v);
}

export function DataTable<T>({
  columns,
  data,
  searchKeys,
  pageSize = 8,
  isLoading = false,
  emptyMessage = "No records found",
  toolbar,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((row) =>
        columns.some((c) =>
          getValue(row as Record<string, unknown>, c.key)
            .toLowerCase()
            .includes(q)
        )
      );
      void searchKeys;
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = getValue(a as Record<string, unknown>, sortKey);
        const bv = getValue(b as Record<string, unknown>, sortKey);
        const an = Number(av);
        const bn = Number(bv);
        const cmp =
          !Number.isNaN(an) && !Number.isNaN(bn) && av !== "" && bv !== ""
            ? an - bn
            : av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, query, columns, sortKey, sortDir, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-3">
      {(searchKeys !== undefined || toolbar) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {searchKeys !== undefined && (
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="sm:max-w-xs"
            />
          )}
          {toolbar}
        </div>
      )}

      <div className="rounded-xl border bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key}>
                  <button
                    type="button"
                    onClick={() => toggleSort(col)}
                    className={`inline-flex items-center gap-1 ${
                      col.sortable
                        ? "cursor-pointer hover:text-foreground"
                        : "cursor-default"
                    }`}
                  >
                    {col.header}
                    {col.sortable &&
                      (sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" />
                      ))}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, i) => (
                <TableRow key={(row as { id?: string }).id ?? String(i)}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render
                        ? col.render(row)
                        : (getValue(row as Record<string, unknown>, col.key) ||
                          "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing{" "}
          {filtered.length === 0
            ? 0
            : (safePage - 1) * pageSize + 1}
          –{Math.min(safePage * pageSize, filtered.length)} of{" "}
          {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


