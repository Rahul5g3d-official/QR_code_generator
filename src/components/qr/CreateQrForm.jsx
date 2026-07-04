import { useState } from "react";
import { Link2, Plus } from "lucide-react";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { createQrCode } from "../../lib/api";
import { getUrlError } from "../../lib/validation";

export function CreateQrForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Enter a clear title.";
    if (title.trim().length > 100) {
      nextErrors.title = "Keep the title under 100 characters.";
    }
    const urlError = getUrlError(originalUrl);
    if (urlError) nextErrors.originalUrl = urlError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = await createQrCode({
        title: title.trim(),
        originalUrl: originalUrl.trim(),
      });
      onCreated(payload.qrCode);
      setTitle("");
      setOriginalUrl("");
      setErrors({});
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create dynamic QR</CardTitle>
        <CardDescription>
          The QR image will contain a tracking URL, not the original destination.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {serverError ? (
            <Alert variant="danger" title="Could not create QR code">
              {serverError}
            </Alert>
          ) : null}

          <Field id="title" label="Title" error={errors.title}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Summer campaign landing page"
                autoComplete="off"
              />
            )}
          </Field>

          <Field
            id="originalUrl"
            label="Original URL"
            hint="Use a complete URL starting with http:// or https://."
            error={errors.originalUrl}
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
                placeholder="https://example.com/product"
                inputMode="url"
              />
            )}
          </Field>

          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Generate QR code
          </Button>
        </form>

        <div className="mt-6 flex gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
          <Link2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Scanners visit the generated tracking link first. The backend records
            basic analytics and then redirects to your destination URL.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
