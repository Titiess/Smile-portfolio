"use client";

import { useActionState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { saveContent, type FormActionState } from "@/app/admin/actions";
import { RichTextEditor } from "@/components/rich-text-editor";
import type { AdminField, AdminModule } from "@/lib/admin-modules";

type ContentFormProps = {
  module: AdminModule;
  fields: AdminField[];
  initialValues: Record<string, string>;
  mediaOptions: { label: string; value: string }[];
};

export function ContentForm({
  module,
  fields,
  initialValues,
  mediaOptions,
}: ContentFormProps) {
  const [state, dispatch, pending] = useActionState(saveContent, {} as FormActionState);
  const [, startTransition] = useTransition();
  const schema = z
    .object({ fields: z.record(z.string(), z.string()) })
    .superRefine((data, context) => {
      for (const field of fields) {
        if (field.required && !data.fields[field.name]?.trim()) {
          context.addIssue({
            code: "custom",
            path: ["fields", field.name],
            message: `${field.label} is required.`,
          });
        }
      }
    });
  const form = useForm<{ fields: Record<string, string> }>({
    resolver: zodResolver(schema),
    defaultValues: {
      fields: Object.fromEntries(
        fields.map((field) => [
          field.name,
          initialValues[field.name] ??
            (field.name === "status"
              ? "DRAFT"
              : field.name === "publicationType"
                ? "OTHER"
                : field.type === "checkbox"
                  ? "false"
                  : ""),
        ]),
      ),
    },
  });
  const watchedFields = useWatch({
    control: form.control,
    name: "fields",
  });

  const handleSubmit = form.handleSubmit((_data, event) => {
    if (!event) return;
    const formData = new FormData(event.currentTarget);
    for (const field of fields) {
      if (field.type === "checkbox") {
        formData.set(
          `fields.${field.name}`,
          form.getValues(`fields.${field.name}`) === "true" ? "true" : "false",
        );
      }
    }
    startTransition(() => dispatch(formData));
  });

  function renderField(field: AdminField) {
    const name = `fields.${field.name}` as const;
    const error = form.formState.errors.fields?.[field.name]?.message;
    const serverError = state.fieldErrors?.[field.name];
    const describedBy = error || serverError ? `${field.name}-error` : undefined;

    if (field.type === "checkbox") {
      return (
        <div className="admin-field admin-field-wide" key={field.name}>
          <label className="admin-checkbox">
            <input
              aria-describedby={describedBy}
              checked={watchedFields[field.name] === "true"}
              name={name}
              onChange={(event) =>
                form.setValue(name, event.target.checked ? "true" : "false", {
                  shouldDirty: true,
                })
              }
              type="checkbox"
              value="true"
            />
            {field.label}
          </label>
          {(error || serverError) && (
            <small className="field-error" id={`${field.name}-error`}>{error ?? serverError}</small>
          )}
        </div>
      );
    }

    if (field.type === "multiselect") {
      const options =
        field.name === "pdfAttachmentIds"
          ? mediaOptions.filter((option) => option.label.startsWith("PDF · "))
          : mediaOptions.filter((option) => option.label.startsWith("Image · "));
      return (
        <div className="admin-field admin-field-wide" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <select
            aria-describedby={describedBy}
            defaultValue={initialValues[field.name]?.split(",").filter(Boolean) ?? []}
            id={field.name}
            multiple
            name={name}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {field.help && <small>{field.help}</small>}
          {(error || serverError) && (
            <small className="field-error" id={`${field.name}-error`}>{error ?? serverError}</small>
          )}
        </div>
      );
    }

    if (field.type === "richtext") {
      return (
        <div className="admin-field admin-field-wide" key={field.name}>
          <label>{field.label}</label>
          <RichTextEditor
            content={form.getValues(name)}
            onChange={(value) => form.setValue(name, value, { shouldDirty: true })}
          />
          {field.help && <small>{field.help}</small>}
          {(error || serverError) && (
            <small className="field-error" id={`${field.name}-error`}>{error ?? serverError}</small>
          )}
          <input name={name} type="hidden" value={watchedFields[field.name] ?? ""} />
        </div>
      );
    }

    const inputType =
      field.type === "date" ? "date" : field.type === "number" ? "number" : "text";
    const options = field.name.toLowerCase().includes("mediaid")
      ? mediaOptions.filter((option) => {
          if (!option.value) return true;
          if (field.name.toLowerCase().includes("image")) {
            return option.label.startsWith("Image · ");
          }
          if (field.name.toLowerCase().includes("pdf")) {
            return option.label.startsWith("PDF · ");
          }
          return true;
        })
      : field.options;

    return (
      <div
        className={`admin-field ${field.type === "textarea" ? "admin-field-wide" : ""}`}
        key={field.name}
      >
        <label htmlFor={field.name}>{field.label}{field.required ? " *" : ""}</label>
        {field.type === "textarea" ? (
          <textarea
            aria-describedby={describedBy}
            id={field.name}
            {...form.register(name)}
          />
        ) : options ? (
          <select
            aria-describedby={describedBy}
            id={field.name}
            {...form.register(name)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ) : (
          <input
            aria-describedby={describedBy}
            id={field.name}
            min={field.type === "number" ? "0" : undefined}
            type={inputType}
            {...form.register(name)}
          />
        )}
        {field.help && <small>{field.help}</small>}
        {(error || serverError) && (
          <small className="field-error" id={`${field.name}-error`}>{error ?? serverError}</small>
        )}
      </div>
    );
  }

  return (
    <form
      className="admin-editor admin-card"
      noValidate
      onSubmit={handleSubmit}
    >
      <input name="module" type="hidden" value={module} />
      <input name="id" type="hidden" value={initialValues.id ?? ""} />
      <div className="admin-card-heading">
        <h2>{initialValues.id ? "Edit content" : "Create content"}</h2>
        <span>Fields marked * are required</span>
      </div>
      <div className="admin-card-body">
        {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
        {state.message && <p className="form-message form-success" role="status">{state.message}</p>}
        <div className="admin-editor-grid">{fields.map(renderField)}</div>
        <div className="admin-editor-actions">
          <button className="admin-button admin-button-primary" disabled={pending || form.formState.isSubmitting} type="submit">
            {pending || form.formState.isSubmitting ? "Saving..." : "Save changes"}
          </button>
          {initialValues.id && (
            <a className="admin-button" href={`/admin/preview/${module}/${initialValues.id}`} target="_blank" rel="noreferrer">
              Preview
            </a>
          )}
          {initialValues.id && (
            <span className="admin-editor-hint">Publishing makes this content visible on the public site.</span>
          )}
        </div>
      </div>
    </form>
  );
}
