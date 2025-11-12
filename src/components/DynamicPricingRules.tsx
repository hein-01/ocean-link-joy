import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

type RuleDraft = {
  id: string;
  rule_name: string;
  price_override: string; // keep as string until submit
  day_of_week: number[]; // 1=Mon..7=Sun
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
};

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function uid() { return Math.random().toString(36).slice(2); }

export function DynamicPricingRules({ resourceId, onSaved }: { resourceId: string; onSaved?: () => void }) {
  const [rules, setRules] = useState<RuleDraft[]>([{
    id: uid(), rule_name: "", price_override: "", day_of_week: [], start_time: "", end_time: ""
  }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function addRule() {
    setRules((r) => [...r, { id: uid(), rule_name: "", price_override: "", day_of_week: [], start_time: "", end_time: "" }]);
  }
  function removeRule(id: string) { setRules((r) => r.filter((x) => x.id !== id)); }
  function updateRule(id: string, patch: Partial<RuleDraft>) {
    setRules((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
  }
  function toggleDay(id: string, dayNum: number) {
    setRules((r) => r.map((x) => {
      if (x.id !== id) return x;
      const set = new Set(x.day_of_week);
      if (set.has(dayNum)) {
        set.delete(dayNum);
      } else {
        set.add(dayNum);
      }
      return { ...x, day_of_week: Array.from(set).sort((a,b)=>a-b) };
    }));
  }

  const canSave = useMemo(() => rules.some(r => r.rule_name && r.price_override && r.start_time && r.end_time), [rules]);

  async function save() {
    setSaving(true); setError(null); setInfo(null);
    try {
      const payload = rules
        .filter(r => r.rule_name && r.price_override && r.start_time && r.end_time)
        .map(r => ({
          resource_id: resourceId,
          rule_name: r.rule_name,
          day_of_week: r.day_of_week.length ? r.day_of_week : null,
          start_time: r.start_time.length === 5 ? `${r.start_time}:00` : r.start_time,
          end_time: r.end_time.length === 5 ? `${r.end_time}:00` : r.end_time,
          price_override: parseFloat(r.price_override)
        }));
      if (!payload.length) {
        setError("Please complete at least one rule before saving.");
        return;
      }
      const { error } = await (supabase as any).from("resource_pricing_rules").insert(payload);
      if (error) throw error;
  setInfo("Pricing rules saved successfully.");
  if (onSaved) onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save pricing rules");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle>Dynamic Pricing Rules</CardTitle>
        <p className="text-sm text-muted-foreground">Note: Pricing rules only apply to days already marked as OPEN in your 'Operating Hours' schedule.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((r, idx) => (
          <div key={r.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Rule {idx + 1}</div>
              <Button type="button" variant="outline" size="sm" onClick={() => removeRule(r.id)}>Remove</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Rule Name</Label>
                <Input value={r.rule_name} onChange={(e)=>updateRule(r.id,{ rule_name: e.target.value })} placeholder="e.g., Peak Hours" />
              </div>
              <div>
                <Label>Price Override</Label>
                <Input type="number" inputMode="decimal" value={r.price_override} onChange={(e)=>updateRule(r.id,{ price_override: e.target.value })} placeholder="e.g., 150" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" value={r.start_time} onChange={(e)=>updateRule(r.id,{ start_time: e.target.value })} />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="time" value={r.end_time} onChange={(e)=>updateRule(r.id,{ end_time: e.target.value })} />
                </div>
              </div>
            </div>

            <div>
              <Label>Days Applicable</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-2">
                {days.map((d, i) => {
                  const dayNum = i + 1; // 1=Mon..7=Sun
                  const checked = r.day_of_week.includes(dayNum);
                  return (
                    <label key={d} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={checked} onCheckedChange={() => toggleDay(r.id, dayNum)} />
                      <span>{d}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3">
          <Button type="button" onClick={addRule}>+ Add Pricing Rule</Button>
          <Button type="button" variant="secondary" disabled={!canSave || saving} onClick={save}>{saving ? "Saving..." : "Save Rules"}</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {info && <div className="text-sm text-green-600">{info}</div>}
      </CardContent>
    </Card>
  );
}

export default DynamicPricingRules;
