import type { Data, DataType, OutputLine, OutputType } from "@/models/code";
import React, { useState } from "react";
import { styled } from "goober";

interface OutputLinesProps {
  log: OutputLine;
}
const OutputLines: React.FC<OutputLinesProps> = ({ log }) => {
  return (
    <>
      {
        log.data.map((data, index) => (
          <Line key={index} data={data} logType={log.type} />
        ))
      }
    </>
  )
};

interface LineProps {
  data: Data;
  logType?: OutputType;
  depth?: number;
}

const Line: React.FC<LineProps> = ({ data, logType, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const type = data.type;
  const isExpandable = type === 'object' || type === 'array';

  if (logType === 'table') {
    return <span style={{ color: "var(--token-table)" }}>{data.value}</span>;
  }

  if (logType === 'error') {
    return <span style={{ color: "var(--token-error)" }}>{data.value}</span>;
  }

  if (!isExpandable) {
    return renderSimpleValue(type, data);
  }

  const parsedValue = JSON.parse(data.value);
  const isArray = Array.isArray(parsedValue);
  const items = isArray ? parsedValue : Object.entries(parsedValue);
  const prefix = isArray ? "[]" : "{}";

  return (
    <div>
      <ExpandableWrapper onClick={() => setIsExpanded(!isExpanded)}>
        <Chevron isExpanded={isExpanded}>{"→"}</Chevron>
        <span style={{ color: "var(--token-keyword)" }}>{prefix[0]}</span>
        {!isExpanded && (
          <span style={{ color: "var(--token-punctuation)" }}>
            {isArray ? `Array(${items.length})` : `Object`}
          </span>
        )}
      </ExpandableWrapper>

      {isExpanded && (
        <ExpandableContent>
          {isArray ? (
            items.map((item: any, index: number) => {
              const itemType = item === null ? 'null' : item === undefined ? 'undefined' : typeof item;

              return (
                <div key={index} style={{ display: 'flex', alignItems: 'start' }}>
                  <span style={{ marginRight: '0.5rem', color: "var(--token-punctuation)" }}>{index}:</span>
                  {item === null || item === undefined ? (
                    <Line
                      data={{ type: itemType, value: itemType }}
                      logType={logType}
                      depth={depth + 1}
                    />
                  ) : (
                    <Line
                      data={{
                        type: Array.isArray(item) ? 'array' : typeof item,
                        value: JSON.stringify(item),
                      }}
                      logType={logType}
                      depth={depth + 1}
                    />
                  )}
                </div>
              );
            })
          ) : Object.entries(parsedValue).map(([key, value]: [string, any]) => {
            const valueType = value === null ? 'null' : value === undefined ? 'undefined' : typeof value;

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'start' }}>
                <span style={{ color: "var(--token-punctuation)", marginRight: '0.5rem' }}>{key}:</span>
                {value === null || value === undefined ? (
                  <Line
                    data={{ type: valueType, value: valueType }} // Mostramos 'null' o 'undefined'
                    logType={logType}
                    depth={depth + 1}
                  />
                ) : (
                  <Line
                    data={{
                      type: Array.isArray(value) ? 'array' : typeof value,
                      value: JSON.stringify(value),
                    }}
                    logType={logType}
                    depth={depth + 1}
                  />
                )}
              </div>
            );
          })}
        </ExpandableContent>
      )}
      {isExpanded && <span style={{ color: "var(--token-keyword)" }}>{prefix[1]}</span>}
    </div>
  );
};

const renderSimpleValue = (type: DataType, data: Data) => {
  switch (type) {
    case 'undefined':
      return <span style={{ color: "var(--token-null)" }}>undefined</span>;
    case 'null':
      return <span style={{ color: "var(--token-null)" }}>null</span>;
    case 'number':
      return <span style={{ color: "var(--token-number)" }}>{data.value}</span>;
    case 'string':
      return <span style={{ color: "var(--token-string)" }}>"{data.value}"</span>;
    case 'boolean':
      return <span style={{ color: "var(--token-boolean)" }}>{data.value}</span>;
    default:
      return <span>{data.value}</span>;
  }
};

const ExpandableWrapper = styled("div")`
  min-width: 6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background-color: var(--hover);
  }
`;

const ExpandableContent = styled("div")`
  margin-left: 1rem;
`;

const Chevron = styled<{ isExpanded: boolean }>("span")`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1rem;
  height: 1rem;
  transform: ${({ isExpanded }) => (isExpanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  user-select: none;
  `;

export default OutputLines