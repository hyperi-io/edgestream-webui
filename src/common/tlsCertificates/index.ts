export type FileRec = { filename: string };

export type Rule = {
  key: string;
  operator?: 'eq' | 'ne' | 'in' | 'nin' | 'truthy' | 'falsy';
  value?: any | any[];
};

export type FieldDef = {
  fieldKey: string;
  title?: string;
  description?: string;
  placeholder?: string;
  enum?: string[];
  type?: 'string' | 'number' | 'boolean' | 'select' | 'text' | 'multiselect';
  required?: boolean;
  requiredWhen?: Rule[];
  dependsOn?: Rule[];
  requires?: Rule[];
  default?: any;
  cast?: string;
};

// Match ANY ...tls... or ...tls_options... path ending with ca_file|crt_file|key_file
export const CERT_KEY_RE = /(?:^|\.)tls(?:_options)?(?:\.[^.]+)*\.(ca_file|crt_file|key_file)$/i;

/**
 * Maps a field key to the correct certificate bucket enum
 */
export function enumForCertKey(
  fieldKey: string,
  buckets: {
    certificateAuthority?: FileRec[];
    certificate?: FileRec[];
    privateKey?: FileRec[];
  },
): string[] | undefined {
  const m = CERT_KEY_RE.exec(fieldKey);
  if (!m) return undefined;

  const leaf = m[1].toLowerCase();
  if (leaf === 'ca_file') return (buckets.certificateAuthority ?? []).map((f) => f.filename);
  if (leaf === 'crt_file') return (buckets.certificate ?? []).map((f) => f.filename);
  if (leaf === 'key_file') return (buckets.privateKey ?? []).map((f) => f.filename);

  return undefined;
}

/**
 * Normalizes a raw schema field into our standardized FieldDef model
 */
export function normalizeFieldDef(
  key: string,
  def: Record<string, any>,
  buckets: Parameters<typeof enumForCertKey>[1],
): FieldDef {
  const baseRequired: boolean = def?.required ?? def?.mandatory ?? false;
  const dependsOn: Rule[] | undefined = (def?.dependsOn) ?? (def?.requires);

  const certEnum = enumForCertKey(key, buckets);
  const finalEnum = certEnum ?? (def?.enum as string[] | undefined);

  const finalRequired = certEnum ? (baseRequired && certEnum.length > 0) : baseRequired;

  return {
    fieldKey: key,
    title: def?.label ?? def?.title,
    description: def?.hint ?? def?.description,
    placeholder: def?.placeholder,
    enum: finalEnum,
    type: def?.type,
    required: !!finalRequired,
    requiredWhen: def?.requiredWhen ?? def?.requiredIf ?? def?.required_when,
    dependsOn,
    requires: [],
    default: def?.default,
    cast: def?.cast,
  };
}

export function buildFieldDefsFromSection(
  section: Record<string, any>,
  buckets: Parameters<typeof enumForCertKey>[1],
): FieldDef[] {
  return Object.entries(section || {}).map(([key, def]) =>
    normalizeFieldDef(key, def ?? {}, buckets)
  );
}

export function clearStaleSelectValues(
  fields: FieldDef[],
  currentValues: Record<string, any>,
  setFlat: (k: string, v: any) => void,
) {
  fields.forEach((f) => {
    if (!Array.isArray(f.enum)) return;
    const cur = currentValues[f.fieldKey];
    if (typeof cur === 'string' && cur && !f.enum.includes(cur)) setFlat(f.fieldKey, '');
    if (Array.isArray(cur)) {
      const filtered = cur.filter((v) => f.enum!.includes(String(v)));
      if (filtered.length !== cur.length) setFlat(f.fieldKey, filtered);
    }
  });
}
