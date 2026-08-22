import { useState } from "react";
import { Building2, Layers, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useOrgStructure } from "@/hooks/useOrgStructure";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LEVELS = ["Entry", "Mid", "Senior", "Lead", "Head"];

export default function AdminDepartments() {
  const {
    departments,
    designations,
    isLoading,
    error,
    refetch,
    addDepartment,
    addDesignation,
  } = useOrgStructure();

  const [deptName, setDeptName] = useState("");
  const [desigName, setDesigName] = useState("");
  const [desigLevel, setDesigLevel] = useState(LEVELS[0]);
  const [savingDept, setSavingDept] = useState(false);
  const [savingDesig, setSavingDesig] = useState(false);

  if (error)
    return (
      <ErrorState
        title="Couldn't load org structure"
        description={error}
        onRetry={refetch}
      />
    );

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDept(true);
    try {
      await addDepartment(deptName.trim());
      toast.success("Department created");
      setDeptName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSavingDept(false);
    }
  };

  const handleAddDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDesig(true);
    try {
      await addDesignation(desigName.trim(), desigLevel);
      toast.success("Designation created");
      setDesigName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSavingDesig(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="size-6" />
          Departments & Designations
        </h1>
        <p className="text-sm text-muted-foreground">
          The building blocks of the org structure
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Departments ({departments.length})</CardTitle>
            <CardDescription>Teams people belong to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddDept} className="flex gap-2">
              <Input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="New department name…"
                required
              />
              <Button type="submit" size="sm" className="gap-1 shrink-0" disabled={savingDept}>
                <Plus className="size-4" />
                Add
              </Button>
            </form>

            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/50" />
              ))
            ) : departments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No departments yet.
              </p>
            ) : (
              <ul className="divide-y">
                {departments.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-sm font-medium">{d.name}</span>
                    <Badge variant="secondary">
                      {d.headCount} {d.headCount === 1 ? "person" : "people"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-4" />
              Designations ({designations.length})
            </CardTitle>
            <CardDescription>Job titles and seniority levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddDesig} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={desigName}
                  onChange={(e) => setDesigName(e.target.value)}
                  placeholder="New designation…"
                  required
                />
                <Button type="submit" size="sm" className="gap-1 shrink-0" disabled={savingDesig}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {LEVELS.map((lv) => (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setDesigLevel(lv)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      desigLevel === lv
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </form>

            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/50" />
              ))
            ) : designations.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No designations yet.
              </p>
            ) : (
              <ul className="divide-y">
                {designations.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-sm font-medium">{d.name}</span>
                    <Badge variant="outline">{d.level}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
