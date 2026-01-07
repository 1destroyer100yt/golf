import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Trash2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfigurationPanelProps {
  value: string;
  onChange: (value: string) => void;
  onLoadExample: () => void;
  onClear: () => void;
}

export function ConfigurationPanel({
  value,
  onChange,
  onLoadExample,
  onClear,
}: ConfigurationPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">Configuration</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">
                  Define players, weeks, availability, preferred/forbidden pairs, and optimization weights.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onLoadExample}>
              <FileText className="h-4 w-4 mr-2" />
              Load Example
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[450px] font-mono text-sm resize-none bg-secondary/30 border-border"
          placeholder="Enter your configuration here..."
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
}
