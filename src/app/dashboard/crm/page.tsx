
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function CrmPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">CRM Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Lead
                </span>
            </Button>
        </div>
      </div>
      <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
                This section is under construction. Full CRM features for sales representatives will be available here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
                You will be able to manage leads, track customer interactions, and view sales pipelines.
            </p>
          </CardContent>
      </Card>
    </div>
  );
}
