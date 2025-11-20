import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';

interface ToneSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTone: string;
  onToneChange: (tone: string) => void;
}

const tones = [
  { value: 'factual', label: 'Factual', description: 'Clear, data-driven insights' },
  { value: 'sarcastic', label: 'Sarcastic', description: 'A bit of wit with honesty' },
  { value: 'firm', label: 'Firm', description: 'Direct and no-nonsense' },
  { value: 'encouraging', label: 'Encouraging', description: 'Positive and supportive' },
];

export function ToneSettingsSheet({ open, onOpenChange, currentTone, onToneChange }: ToneSettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-[#F5F3EF] border-l-[#E8E6E1]">
        <SheetHeader>
          <SheetTitle className="text-[#2E3F4F]">Settings</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          <div className="space-y-3">
            <label className="text-sm text-[#6B7280]">Accountability Partner Tone</label>
            <Select value={currentTone} onValueChange={onToneChange}>
              <SelectTrigger className="w-full h-14 bg-white border-[#E8E6E1] rounded-2xl px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-[#E8E6E1]">
                {tones.map((tone) => (
                  <SelectItem 
                    key={tone.value} 
                    value={tone.value}
                    className="rounded-xl cursor-pointer"
                  >
                    <div className="flex flex-col items-start py-1">
                      <span className="text-[#2E3F4F]">{tone.label}</span>
                      <span className="text-xs text-[#9CA3AF]">{tone.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-[#E8F5F1] border border-[#7DD3C0] rounded-2xl p-4">
            <p className="text-sm text-[#4A5C6A]">
              {tones.find(t => t.value === currentTone)?.description}
            </p>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 mt-6"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
