import { cn } from "@/lib/utils";
import Text from "@/refresh-components/texts/Text";
import React, { useState, ReactNode, useCallback, useMemo, memo, useEffect } from "react";
import { SvgCheck, SvgCode, SvgCopy } from "@opal/icons";
import KrokiDiagram from "@/components/chat/KrokiDiagram";
import { KROKI_SUPPORTED_LANGUAGES } from "@/lib/kroki_constants";

// Module-level flag to track if Kroki feature is confirmed disabled for the session
let isKrokiFeatureConfirmedDisabled = false;


interface CodeBlockProps {
  className?: string;
  children?: ReactNode;
  codeText: string;
  isFallback?: boolean; // Added prop to prevent recursion
}

const MemoizedCodeLine = memo(({ content }: { content: ReactNode }) => (
  <>{content}</>
));

export const CodeBlock = memo(function CodeBlock({
  className = "",
  children,
  codeText,
  isFallback = false, // Default to false
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  // Local state to force re-render if isKrokiFeatureConfirmedDisabled changes
  const [krokiDisabledSignal, setKrokiDisabledSignal] = useState(isKrokiFeatureConfirmedDisabled);

  useEffect(() => {
    // This effect ensures that if the global flag changes, this component instance re-evaluates
    if (isKrokiFeatureConfirmedDisabled !== krokiDisabledSignal) {
      setKrokiDisabledSignal(isKrokiFeatureConfirmedDisabled);
    }
  }, [krokiDisabledSignal]);


  const language = useMemo(() => {
    return className
      .split(" ")
      .filter((cls) => cls.startsWith("language-"))
      .map((cls) => cls.replace("language-", ""))
      .join(" ");
  }, [className]);

  const handleCopy = useCallback(() => {
    if (!codeText) return;
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [codeText]);

  const CopyButton = () => (
    <div
      className="ml-auto cursor-pointer select-none"
      onMouseDown={handleCopy}
    >
      {copied ? (
        <div className="flex items-center space-x-2">
          <SvgCheck height={14} width={14} stroke="currentColor" />
          <Text as="p" secondaryMono>
            Copied!
          </Text>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <SvgCopy height={14} width={14} stroke="currentColor" />
          <Text as="p" secondaryMono>
            Copy
          </Text>
        </div>
      )}
    </div>
  );

  if (typeof children === "string" && !language) {
    return (
      <span
        data-testid="code-block"
        className={cn(
          "font-mono",
          "text-text-05",
          "bg-background-tint-00",
          "rounded",
          "text-[0.75em]",
          "inline",
          "whitespace-pre-wrap",
          "break-words",
          "py-0.5",
          "px-1",
          className
        )}
      >
        {children}
      </span>
    );
  }

  // If Kroki is not confirmed disabled, language is supported,
  // it's a fenced code block, codeText is not empty, AND it's not already a fallback.
  if (
    !isFallback && // Check if this CodeBlock instance is NOT a fallback
    !isKrokiFeatureConfirmedDisabled &&
    language &&
    KROKI_SUPPORTED_LANGUAGES.has(language) &&
    typeof children !== "string" && 
    codeText.trim() !== ""
  ) {
    return (
      <KrokiDiagram
        diagramType={language}
        codeText={codeText}
        onFeatureDisabled={() => {
          if (!isKrokiFeatureConfirmedDisabled) {
            isKrokiFeatureConfirmedDisabled = true;
            setKrokiDisabledSignal(true); // Trigger re-render for other instances
          }
        }}
      />
    );
  }

  // Original CodeContent rendering logic for standard code blocks or when Kroki is not applicable
  const CodeContent = () => {
    if (!language) {
      // This typically handles cases where it might be a simple preformatted block
      // without a language, or if the language wasn't parsed correctly.
      return (
        <pre className="!p-2 m-0 overflow-x-auto w-0 min-w-full hljs">
          <code className={`text-sm hljs ${className}`}>
            {Array.isArray(children)
              ? children.map((child, index) => (
                  <MemoizedCodeLine key={index} content={child} />
                ))
              : children}
          </code>
        </pre>
      );
    }

    // Standard fenced code block rendering
    return (
      <pre className="!p-2 m-0 overflow-x-auto w-0 min-w-full hljs">
        <code className="text-xs">
          {Array.isArray(children)
            ? children.map((child, index) => (
                <MemoizedCodeLine key={index} content={child} />
              ))
            : children}
        </code>
      </pre>
    );
  };

  // Original return structure for non-Kroki code blocks
  return (
    <div className="bg-background-tint-00 px-1 pb-1 rounded-12 max-w-full min-w-0">
      {language && (
        <div className="flex items-center px-2 py-1 text-sm text-text-04 gap-x-2">
          <SvgCode
            height={12}
            width={12}
            stroke="currentColor"
            className="my-auto"
          />
          <Text secondaryMono>{language}</Text>
          {codeText && <CopyButton />}
        </div>
      )}

      <CodeContent />
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";
MemoizedCodeLine.displayName = "MemoizedCodeLine";
