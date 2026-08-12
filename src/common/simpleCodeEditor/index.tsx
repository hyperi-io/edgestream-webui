import React, { useState, useMemo } from 'react';
import rehypePrism from 'rehype-prism-plus';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useUpdateEffect } from 'react-use';

interface SimpleCodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: 'js' | 'json' | 'yaml' | 'lua' | 'xml';
  placeholder?: string;
  minHeight?: number;
}

const SimpleCodeEditor: React.FC<SimpleCodeEditorProps> = ({
                                                             onChange,
                                                             value = '',
                                                             language = 'js',
                                                             placeholder = 'Please enter query...',
                                                             minHeight = 80
                                                           }) => {
  const rehypePlugins = useMemo(() => [
    [rehypePrism, { ignoreMissing: true, showLineNumbers: true }],
  ], []);

  const [text, setText] = useState<string>(value);

  useUpdateEffect(() => {
    setText(value);
  }, [value]);

  const handleChange = (val: string) => {
    setText(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="w-full rounded-md overflow-hidden border border-gray-700">
      <CodeEditor
        value={text}
        language={language}
        placeholder={placeholder}
        onChange={(evn) => handleChange(evn.target.value)}
        padding={15}
        rehypePlugins={rehypePlugins as any}
        minHeight={typeof minHeight === 'string' ? parseInt(minHeight, 10) : minHeight}
        style={{
          fontSize: 13,
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        }}
      />
    </div>
  );
};

export default SimpleCodeEditor;
