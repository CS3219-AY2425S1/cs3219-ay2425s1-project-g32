import { type ElementRef, useMemo, useRef, useState } from 'react';

import { InfoIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { LANGUAGES, EXECUTABLE_LANGUAGES } from '@/components/codeEditor/data/languages';
import { THEMES } from '@/components/codeEditor/useThemesExtension';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import CodeMirrorEditor from './codeEditor';
import Tests from './tests';

type PanelRefType = ElementRef<typeof ResizablePanel>;

const CodeAndSubmit = () => {
  const testsPanelRef = useRef<PanelRefType>(null);
  const { resolvedTheme } = useTheme();
  const [language, setLanguage] = useState<string>(LANGUAGES.PYTHON);
  const [theme, setTheme] = useState<string>(
    resolvedTheme === 'dark' ? THEMES.SOLARIZED_DARK : THEMES.SOLARIZED_LIGHT
  );
  const [code, setCode] = useState<string>('');
  const executable = useMemo(
    () => Object.values(EXECUTABLE_LANGUAGES).includes(language),
    [language]
  );

  const expand = () => {
    if (testsPanelRef?.current) {
      testsPanelRef.current.resize(50);
    }
  };

  return (
    <div className="flex-grow bg-muted/50 p-4">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel ref={testsPanelRef} defaultSize={100} minSize={50}>
          <div className="flex h-full flex-col">
            <div className="mb-4 flex justify-between rounded-lg border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-x-2">
                <SidebarTrigger className="text-gray-500" />
                <Select value={language} onValueChange={(v) => setLanguage(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LANGUAGES).map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>Language does not support execution currently.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={theme} onValueChange={(v) => setTheme(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(THEMES).map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow overflow-hidden rounded-lg border">
              <CodeMirrorEditor language={language} theme={theme} onCodeChange={setCode} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="my-5" />
        <ResizablePanel style={{ overflow: 'scroll' }} minSize={8}>
          {executable && <Tests expand={expand} code={code} language={language} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default CodeAndSubmit;
