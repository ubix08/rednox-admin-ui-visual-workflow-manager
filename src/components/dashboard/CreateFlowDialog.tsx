import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useAppStore } from '@/store/useAppStore';
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
});
export function CreateFlowDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addFlow = useAppStore((s) => s.addFlow);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const id = uuidv4();
    const newFlow = {
      id,
      ...values,
      status: 'draft' as const,
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Perform operations in the handler, not render body
    addFlow(newFlow);
    // Defer state updates to ensure cleanup
    setTimeout(() => {
      setOpen(false);
      setIsSubmitting(false);
      navigate(`/flow/${id}`);
    }, 300);
  };
  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && setOpen(val)}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm hover:shadow-md transition-shadow">
          <Plus className="h-4 w-4" />
          Create New Flow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
          <DialogDescription>
            Give your new workflow a name and description to get started.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Daily Data Sync" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain what this flow does..."
                      className="resize-none"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing Canvas...
                  </>
                ) : (
                  "Initialize Editor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}