import { getDeep } from 'common/utils/deepPathUtils';
import { FieldDef } from 'common/fieldItemMantine';

export type Operator = 'eq' | 'ne' | 'in' | 'nin' | 'truthy' | 'falsy';

export type Rule = {
  key: string;
  operator?: Operator;
  value?: any | any[];
};

export type RequirementSet = {
  when?: Rule[];
  require: string[];
};

export function evalRule(rule: any, values: Record<string, any>): boolean {
  if (!rule?.key) return true;
  const op = rule.operator ?? 'eq';
  const cur = getDeep(values, rule.key);

  switch (op) {
    case 'truthy': return !!cur;
    case 'falsy': return !cur;
    case 'eq': return cur === rule.value;
    case 'ne': return cur !== rule.value;
    case 'in': return Array.isArray(rule.value) ? rule.value.includes(cur) : false;
    case 'nin': return Array.isArray(rule.value) ? !rule.value.includes(cur) : true;
    default: return true;
  }
}

export function rulesMatch(rules: any[] | undefined, values: Record<string, any>): boolean {
  if (!rules?.length) return true;
  return rules.every((r) => evalRule(r, values));
}

export function isFieldVisible(field: FieldDef, values: Record<string, any>): boolean {
  const rules = field.dependsOn || field.requires;
  if (!rules?.length) return true;
  return rules.every((r) => evalRule(r, values));
}

export function isFieldRequired(field: FieldDef, values: Record<string, any>): boolean {
  if (field.required) return true;
  if (!field.requires || field.requires.length === 0) return false;
  return rulesMatch(field.requires, values);
}

export function isRequiredByRequirementSets(
  fieldKey: string,
  values: Record<string, any>,
  sets?: RequirementSet[],
): boolean {
  if (!sets || sets.length === 0) return false;
  return sets.some(
    (set) =>
      rulesMatch(set.when, values) &&
      Array.isArray(set.require) &&
      set.require.includes(fieldKey),
  );
}

export function valueIsEmpty(val: any, type?: FieldDef['type']): boolean {
  if (type === 'boolean') return val === undefined || val === null;
  if (Array.isArray(val)) return val.length === 0;
  return val === undefined || val === null || val === '';
}
