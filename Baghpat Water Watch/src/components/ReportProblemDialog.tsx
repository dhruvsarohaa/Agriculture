import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BLOCKS } from "@/data/demo-dataset";
import { REPORT_TYPE_LABELS, type ReportType } from "@/data/types";
import { createReport } from "@/services/reports-store";
import { PrototypeNotice } from "./PrototypeNotice";

const reportTypes = Object.keys(REPORT_TYPE_LABELS) as ReportType[];

export function ReportProblemDialog({
  triggerClassName,
  triggerLabel = "Report a Water Problem",
  size = "lg",
}: {
  triggerClassName?: string;
  triggerLabel?: string;
  size?: "default" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReportType | "">("");
  const [block, setBlock] = useState<string>("");
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  function reset() {
    setType("");
    setBlock("");
    setLocationText("");
    setCoords(null);
    setDescription("");
    setName("");
    setPhotoName(null);
    setLocationError(null);
    setError(null);
    setSubmittedId(null);
  }

  function useBrowserLocation() {
    setLocationError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError(
        "Location is not available on this device. Please type the location instead.",
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError("Could not get your location. Please type the location instead.");
      },
      { timeout: 8000 },
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!type) {
      setError("Please choose the type of problem.");
      return;
    }
    if (!block) {
      setError("Please choose your block.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Please describe the problem in at least 10 characters.");
      return;
    }
    if (description.trim().length > 1000) {
      setError("Description must be under 1000 characters.");
      return;
    }
    if (!coords && locationText.trim().length === 0) {
      setError("Please share your location or type a village/landmark.");
      return;
    }
    setSubmitting(true);
    try {
      const report = createReport({
        report_type: type,
        latitude: coords?.lat ?? null,
        longitude: coords?.lon ?? null,
        block,
        location_text: locationText.trim() || `${block} block`,
        description: description.trim().slice(0, 1000),
        reporter_name: name.trim().slice(0, 100) || null,
        photo_url: photoName ? `local://${photoName}` : null,
      });
      setSubmittedId(report.id);
    } catch {
      setError("Report submission failed. Nothing was saved — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size={size} className={triggerClassName}>
          <TriangleAlert className="size-4" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {submittedId ? (
          <div className="space-y-4 py-2 text-center">
            <CheckCircle2 className="mx-auto size-12 text-safe" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold">Report submitted successfully</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep this reference number for follow-up.
              </p>
            </div>
            <p className="rounded-md border border-border bg-muted px-3 py-2 font-mono text-base font-semibold">
              {submittedId}
            </p>
            <PrototypeNotice>
              This is a demo report ID generated locally by the prototype. No government office has
              been notified.
            </PrototypeNotice>
            <DialogFooter className="sm:justify-center">
              <Button variant="outline" onClick={() => reset()}>
                Report another problem
              </Button>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Report a water problem</DialogTitle>
              <DialogDescription>
                Tell us what is happening with water near you. Only the problem, location and
                description are required.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="problem-type">Problem type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
                <SelectTrigger id="problem-type" className="h-11">
                  <SelectValue placeholder="Choose a problem" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {REPORT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block">Block</Label>
              <Select value={block} onValueChange={setBlock}>
                <SelectTrigger id="block" className="h-11">
                  <SelectValue placeholder="Choose your block" />
                </SelectTrigger>
                <SelectContent>
                  {BLOCKS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="location"
                  className="h-11"
                  placeholder="Village, ward or landmark"
                  maxLength={120}
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={useBrowserLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <MapPin className="size-4" aria-hidden />
                  )}
                  Use my location
                </Button>
              </div>
              {coords ? (
                <p className="font-mono text-[11px] text-muted-foreground">
                  Location captured: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                </p>
              ) : null}
              {locationError ? (
                <p className="text-xs font-medium text-critical">{locationError}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                maxLength={1000}
                placeholder="For example: the hand pump has had no water for five days."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="photo">Photo (optional)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="h-11 pt-2.5"
                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
                />
                {photoName ? (
                  <p className="truncate text-[11px] text-muted-foreground">
                    Attached: {photoName} (kept on device in this prototype)
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporter">Your name (optional)</Label>
                <Input
                  id="reporter"
                  className="h-11"
                  maxLength={100}
                  placeholder="Optional"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-md border border-critical/40 bg-critical-soft px-3 py-2 text-xs font-medium text-critical"
              >
                {error}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
