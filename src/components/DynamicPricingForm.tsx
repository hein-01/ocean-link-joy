import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { createPricingRule, fetchPricingRules, deletePricingRule } from "@/lib/bookingUtils";

interface DynamicPricingFormProps {
  resourceId: string;
}

interface PricingRule {
  id: string;
  rule_name: string;
  price_override: number;
  day_of_week: number[];
  start_time: string;
  end_time: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export function DynamicPricingForm({ resourceId }: DynamicPricingFormProps) {
  const [ruleName, setRuleName] = useState("");
  const [priceOverride, setPriceOverride] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [existingRules, setExistingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPricingRules();
  }, [resourceId]);

  const loadPricingRules = async () => {
    try {
      const rules = await fetchPricingRules(resourceId) as any;
      setExistingRules(rules);
    } catch (error) {
      console.error("Error loading pricing rules:", error);
    }
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ruleName || !priceOverride || selectedDays.length === 0 || !startTime || !endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await createPricingRule({
        resource_id: resourceId,
        rule_name: ruleName,
        price_override: parseFloat(priceOverride),
        day_of_week: selectedDays,
        start_time: startTime,
        end_time: endTime,
      });

      toast.success("Pricing rule created successfully");
      
      // Reset form
      setRuleName("");
      setPriceOverride("");
      setSelectedDays([]);
      setStartTime("");
      setEndTime("");
      
      // Reload rules
      await loadPricingRules();
    } catch (error: any) {
      toast.error(error.message || "Failed to create pricing rule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await deletePricingRule(ruleId);
      toast.success("Pricing rule deleted");
      await loadPricingRules();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete pricing rule");
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDayNames = (days: number[]) => {
    return days
      .sort()
      .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
      .join(", ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dynamic Pricing Rules</CardTitle>
        <CardDescription>
          Note: Pricing rules only apply to days already marked as OPEN in your 'Operating Hours' schedule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ruleName">Rule Name</Label>
            <Input
              id="ruleName"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g., Weekend Premium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceOverride">Price Override</Label>
            <Input
              id="priceOverride"
              type="number"
              step="0.01"
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
              placeholder="Enter price"
            />
          </div>

          <div className="space-y-3">
            <Label>Days Applicable</Label>
            <div className="grid grid-cols-2 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Add Pricing Rule"}
          </Button>
        </form>

        {existingRules.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Existing Pricing Rules</h3>
            {existingRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{rule.rule_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Price: ${rule.price_override}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Days: {getDayNames(rule.day_of_week)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time: {formatTime(rule.start_time)} - {formatTime(rule.end_time)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
