
import {
  Bot,
  CheckCheck,
  HardHat,
  SlidersHorizontal,
  Voicemail,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const aiTools = [
  {
    href: "/dashboard/forecasting",
    icon: Bot,
    label: "Material Forecasting",
    description: "Predict future material needs based on project data.",
  },
  {
    href: "/dashboard/waste-reduction",
    icon: SlidersHorizontal,
    label: "Waste Reduction",
    description: "Analyze data to find and reduce material waste.",
  },
  {
    href: "/dashboard/voice-reporting",
    icon: Voicemail,
    label: "Voice Reporting",
    description: "Generate site reports using voice commands.",
  },
  {
    href: "/dashboard/defect-detection",
    icon: HardHat,
    label: "Defect Detection",
    description: "Use drone imagery to spot construction defects.",
  },
  {
    href: "/dashboard/compliance",
    icon: CheckCheck,
    label: "Compliance Checks",
    description: "Automatically verify compliance with regulations.",
  },
];

export default function AiToolsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">AI Tools Hub</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {aiTools.map((tool) => (
          <Link href={tool.href} key={tool.href}>
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <tool.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{tool.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
