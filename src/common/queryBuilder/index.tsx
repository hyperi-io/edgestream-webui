import React from 'react';
import { QueryBuilderMantine } from '@react-querybuilder/mantine';
import { QueryBuilder as RQB, type RuleGroupType, type Field } from 'react-querybuilder';

import CustomFieldSelector from './CustomFieldSelector';
import CustomValueEditor from './CustomValueEditor';

type Props = {
  value: RuleGroupType;
  onChange: (q: RuleGroupType) => void;
  fields?: Field[];
  [key: string]: any;
};

const QueryBuilder: React.FC<Props> = ({
                                         value,
                                         onChange,
                                         fields = [],
                                         ...rest
                                       }) => {
  return (
    <QueryBuilderMantine>
      <RQB
        {...rest}
        fields={fields}
        query={value}
        onQueryChange={onChange}
        controlElements={{
          fieldSelector: CustomFieldSelector,
          valueEditor: CustomValueEditor,
        }}
      />
    </QueryBuilderMantine>
  );
};

export default QueryBuilder;
