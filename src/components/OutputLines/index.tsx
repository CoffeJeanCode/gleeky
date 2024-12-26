import type { Data, DataType, OutputLine, OutputType } from "@/models/code";
import React, { useState } from "react";
import { styled } from "goober";

interface OutputLinesProps {
  log: OutputLine;
}
const OutputLines: React.FC<OutputLinesProps> = ({ log }) => {
  return log.data.map((data, index) => (
    <Line key={index} data={data} logType={log.type} />
  ))
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
    return <OrangeText>{data.value}</OrangeText>;
  }

  if (logType === 'error') {
    return <RedText>Error: {data.value}</RedText>;
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
        <GrayText>{prefix[0]}</GrayText>
        {!isExpanded && (
          <GrayText>
            {isArray ? `Array(${items.length})` : `Object`}
          </GrayText>
        )}
      </ExpandableWrapper>

      {isExpanded && (
        <ExpandableContent>
          {isArray ? (
            items.map((item: any, index: number) => {
              const itemType = item === null ? 'null' : item === undefined ? 'undefined' : typeof item;

              return (
                <div key={index} style={{ display: 'flex', alignItems: 'start' }}>
                  <GrayText style={{ marginRight: '0.5rem' }}>{index}:</GrayText>
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
                <YellowText style={{ marginRight: '0.5rem' }}>{key}:</YellowText>
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
      {isExpanded && <GrayText>{prefix[1]}</GrayText>}
    </div>
  );
};

const renderSimpleValue = (type: DataType, data: Data) => {
  switch (type) {
    case 'undefined':
      return <GrayText>undefined</GrayText>;
    case 'null':
      return <GrayText>null</GrayText>;
    case 'number':
      return <BlueText>{data.value}</BlueText>;
    case 'string':
      return <GreenText>"{data.value}"</GreenText>;
    case 'boolean':
      return <PurpleText>{data.value}</PurpleText>;
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
    background-color:rgb(49, 49, 49);
  }
`;

const ExpandableContent = styled("div")`
  margin-left: 1rem;
`;

const Text = styled("span")`
  display: inline-block;
  font-weight: 600;
`

const YellowText = styled(Text)`
  color: #eee930;
`;

const GrayText = styled(Text)`
  color: #6b7280;
`;

const BlueText = styled(Text)`
  color:rgb(121, 172, 253);
`;

const GreenText = styled(Text)`
  color: #10b981;
`;

const RedText = styled(Text)`
  color:rgb(185, 16, 16);
`;

const PurpleText = styled(Text)`
  color: #8b5cf6;
`;

const OrangeText = styled(Text)`
  color: #f59e0b;
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