"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { eventTypeSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type FormValues = z.input<typeof eventTypeSchema>;

export function EventTypeForm({
  initialValues,
  eventTypeId,
}: {
  initialValues?: Partial<FormValues>;
  eventTypeId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      duration: initialValues?.duration ?? 30,
      bufferBefore: initialValues?.bufferBefore ?? 0,
      bufferAfter: initialValues?.bufferAfter ?? 0,
      customQuestions: initialValues?.customQuestions ?? [],
    },
  });
  const questions = useFieldArray({
    control: form.control,
    name: "customQuestions",
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) =>
      apiFetch("/api/event-types" + (eventTypeId ? `/${eventTypeId}` : ""), {
        method: eventTypeId ? "PUT" : "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
      toast.success(eventTypeId ? "Event type updated" : "Event type created");
      router.push("/");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="rounded-2xl border-none shadow-sm">
      <CardHeader>
        <CardTitle>{eventTypeId ? "Edit Event Type" : "Create Event Type"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input className="rounded-2xl" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea className="rounded-2xl" {...form.register("description")} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input type="number" className="rounded-2xl" {...form.register("duration")} />
            </div>
            <div className="space-y-2">
              <Label>Buffer Before</Label>
              <Input type="number" className="rounded-2xl" {...form.register("bufferBefore")} />
            </div>
            <div className="space-y-2">
              <Label>Buffer After</Label>
              <Input type="number" className="rounded-2xl" {...form.register("bufferAfter")} />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-zinc-100">Custom booking questions</h3>
                <p className="text-sm text-zinc-400">
                  Ask guests extra details before confirming the booking.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => questions.append({ label: "", required: false })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add question
              </Button>
            </div>

            <div className="space-y-3">
              {questions.fields.length === 0 && (
                <p className="text-sm text-zinc-400">
                  No custom questions yet. Add one if you want extra guest context.
                </p>
              )}
              {questions.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-[1fr_auto_auto]"
                >
                  <Input
                    className="rounded-xl"
                    placeholder="e.g. What would you like to discuss?"
                    {...form.register(`customQuestions.${index}.label`)}
                  />
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <Controller
                      control={form.control}
                      name={`customQuestions.${index}.required`}
                      render={({ field }) => (
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      )}
                    />
                    Required
                  </label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    className="rounded-xl"
                    onClick={() => questions.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button className="rounded-2xl" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Event Type"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
