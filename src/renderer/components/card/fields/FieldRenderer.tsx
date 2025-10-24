import React from 'react';
import type { FieldDefinition, FieldValue } from '../../../../shared/types';
import { TextField } from './TextField';
import { LongTextField } from './LongTextField';
import { NumberField } from './NumberField';
import { BooleanField } from './BooleanField';
import { SelectField } from './SelectField';
import { LinkField } from './LinkField';
import { ImageField } from './ImageField';
import { MultiSelectField } from './MultiSelectField';
import { DateField } from './DateField';
import { DateTimeField } from './DateTimeField';
import { ColorField } from './ColorField';
import { UrlField } from './UrlField';
import { DiceField } from './DiceField';

interface FieldRendererProps {
  field: FieldDefinition;
  value: FieldValue;
  cardId?: string;
  onChange?: (value: FieldValue) => void;
  readOnly?: boolean;
}



export function FieldRenderer({ field, value, cardId, onChange, readOnly }: FieldRendererProps) {
  // Render different components based on field type
  switch (field.type) {
    case 'text':
      return <TextField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
   
    case 'longtext':
      return <LongTextField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
   
    case 'number':
      return <NumberField field={field} value={value as number} onChange={onChange as any} readOnly={readOnly} />;
   
    case 'boolean':
      return <BooleanField field={field} value={value as boolean} onChange={onChange as any} readOnly={readOnly} />;
   
    case 'select':
      return <SelectField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
    case 'link':
      if (!cardId) {
        return <div className="text-red-500">Error: cardId required for link fields</div>;
      }
      return (
        <LinkField
          field={field}
          cardId={cardId}
          onChange={() => onChange?.(null)} // Trigger parent refresh
          readOnly={readOnly}
        />
      );

    case 'multiselect':
      return <MultiSelectField field={field} value={value as string[]} onChange={onChange as any} readOnly={readOnly} />;
    case 'date':
      return <DateField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
    case 'datetime':
      return <DateTimeField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
    case 'color':
      return <ColorField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
    case 'url':
      return <UrlField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
    case 'dice':
      return <DiceField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
    case 'image':
      return <ImageField field={field} value={value as string} onChange={onChange as any} readOnly={readOnly} />;
    default:
      return <div className="text-red-500">Unknown field type: {field.type}</div>;
  }
}
