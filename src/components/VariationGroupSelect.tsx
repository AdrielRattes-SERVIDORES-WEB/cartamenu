import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { VariationGroup } from '@/types/product';

interface VariationGroupSelectProps {
  group: VariationGroup;
  selected?: string[] | string;
  onSelect: (itemIds: string[] | string) => void;
  allowMultiple?: boolean;
  minSelections?: number;
  maxSelections?: number;
  currency?: string;
}

export const VariationGroupSelect: React.FC<VariationGroupSelectProps> = ({
  group,
  selected = allowMultiple ? [] : '',
  onSelect,
  allowMultiple = false,
  minSelections = 0,
  maxSelections,
  currency = 'EUR'
}) => {
  const selectedArray = Array.isArray(selected) ? selected : (selected ? [selected] : []);

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    if (!allowMultiple) return;

    let newSelected = [...selectedArray];
    if (checked) {
      if (!maxSelections || newSelected.length < maxSelections) {
        newSelected.push(itemId);
      }
    } else {
      newSelected = newSelected.filter(id => id !== itemId);
    }
    onSelect(newSelected);
  };

  const handleRadioChange = (itemId: string) => {
    if (allowMultiple) return;
    onSelect(itemId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'EUR' ? 'EUR' : currency,
    }).format(price);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-lg">{group.title}</h3>
      
      {!allowMultiple ? (
        // Radio group for single selection
        <RadioGroup value={selectedArray[0] || ''} onValueChange={handleRadioChange}>
          {group.items.map(item => (
            <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <RadioGroupItem value={item.id} id={item.id} />
              <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between">
                  <span>{item.title}</span>
                  {item.price > 0 && <span className="text-green-600 font-medium">+{formatPrice(item.price)}</span>}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        // Checkboxes for multiple selection
        <div className="space-y-2">
          {group.items.map(item => (
            <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <Checkbox
                id={item.id}
                checked={selectedArray.includes(item.id)}
                onCheckedChange={(checked) => handleCheckboxChange(item.id, !!checked)}
                disabled={
                  !selectedArray.includes(item.id) &&
                  maxSelections &&
                  selectedArray.length >= maxSelections
                }
              />
              <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between">
                  <span>{item.title}</span>
                  {item.price > 0 && <span className="text-green-600 font-medium">+{formatPrice(item.price)}</span>}
                </div>
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Info text */}
      {allowMultiple && (
        <p className="text-xs text-gray-500 mt-2">
          {minSelections && minSelections > 0
            ? `Selecione de ${minSelections} a ${maxSelections || 'ilimitadas'}`
            : maxSelections
            ? `Selecione até ${maxSelections}`
            : 'Selecione quantas desejar'}
        </p>
      )}
    </div>
  );
};

export default VariationGroupSelect;
