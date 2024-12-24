import React, { useState } from "react";
import { LogType } from "../../types/code";
import { styled } from "goober";

interface OutputLinesProps {
  log: LogType;
}
const OutputLines: React.FC<OutputLinesProps> = ({ log }) => {
  return log.data.map((data, idx) => (<Line key={idx} data={data} logType={log.type} />))
};

interface LineProps {
  data: any;
  logType?: string;
  depth?: number;
}

const Line: React.FC<LineProps> = ({ data, logType, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const type = Array.isArray(data) ? 'array' : typeof data;
  const isExpandable = (type === 'object' && data !== null) || type === 'array';

  if (data === null) return <GrayText>null</GrayText>;
  if (data === undefined) return <GrayText>undefined</GrayText>;
  if (logType === 'error') return <RedText>Error: {data.toString()}</RedText>;
  if (type === 'number') return <BlueText>{data}</BlueText>;
  if (type === 'string') return <GreenText>"{data}"</GreenText>;
  if (type === 'boolean') return <PurpleText>{data.toString()}</PurpleText>;

  if (isExpandable) {
    const items: [string, unknown][] = type === 'array' ? data : Object.entries(data);
    const prefix = type === 'array' ? '[]' : '{}';

    return (
      <div>
        <ExpandableWrapper onClick={() => setIsExpanded(!isExpanded)}>
          {isExpandable && <Chevron isExpanded={isExpanded}>{"→"}</Chevron>}
          <GrayText>{prefix[0]}</GrayText>
          {!isExpanded && (
            <GrayText>
              {type === 'array' ? `Array(${items.length})` : `Object`}
            </GrayText>
          )}
        </ExpandableWrapper>

        {isExpanded && (
          <ExpandableContent>
            {type === 'array' ? (
              items.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'start' }}>
                  <GrayText style={{ marginRight: '0.5rem' }}>{index}:</GrayText>
                  <Line data={item} depth={depth + 1} />
                </div>
              ))
            ) : (
              Object.entries(data).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'start' }}>
                  <span style={{ color: 'rgb(238, 233, 48)', marginRight: '0.5rem' }}>{key}:</span>
                  <Line data={value} depth={depth + 1} />
                </div>
              ))
            )}
          </ExpandableContent>
        )}
        {isExpanded && <GrayText>{prefix[1]}</GrayText>}
      </div>
    );
  }

  return <span>{String(data)}</span>;
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
  display: block;
`

const GrayText = styled(Text)`
  color: #6b7280;
`;

const BlueText = styled(Text)`
  color: #3b82f6;
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