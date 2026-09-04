import CountUp from "react-countup";
import { Badge, Card, Flex, Typography, Skeleton } from "antd";
import config from "../config";

const { Text } = Typography;
const presetColors = config.presetColors;

export const getCountDecimals = (value) => {
  const num = Number(value) || 0;
  return Number.isInteger(num) ? 0 : 2;
};

export const StatCountUp = ({ value, prefix, decimals, replayKey }) => (
  <CountUp
    key={replayKey}
    start={0}
    end={Number(value) || 0}
    duration={0.8}
    separator=","
    decimals={decimals ?? getCountDecimals(value)}
    prefix={prefix || ""}
  />
);

export const cardAccent = (index) => {
  const color = presetColors[index % presetColors.length];
  return {
    ribbonColor: color,
    iconColor: color,
    iconBg: `${color}1a`,
  };
};

export default function StatRibbonCard({
  item,
  loading = false,
  replayKey,
  cardStyle,
  extra,
  hoverable = true,
  onClick,
}) {
  const clickable = typeof onClick === "function";
  return (
    <div
      className="block h-full w-full [&>.ant-ribbon-wrapper]:block [&>.ant-ribbon-wrapper]:h-full [&>.ant-ribbon-wrapper]:w-full"
      onClick={clickable ? onClick : undefined}
      style={clickable ? { cursor: "pointer" } : undefined}
    >
      <Badge.Ribbon text={item.ribbonText} color={item.ribbonColor}>
        <Card
          hoverable={hoverable}
          className="h-full w-full rounded-xl"
          style={cardStyle}
          styles={{ body: { padding: 20, height: "100%" } }}
        >
          <Skeleton
            loading={loading}
            active
            paragraph={{ rows: 1 }}
            title={false}
          >
            <Flex align="center" gap={16}>
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[22px]"
                style={{ background: item.iconBg, color: item.iconColor }}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <Text type="secondary" className="text-[13px]">
                  {item.title}
                </Text>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-[25px] font-semibold leading-tight text-slate-900">
                    <StatCountUp
                      value={item.value}
                      prefix={item.prefix}
                      decimals={item.decimals}
                      replayKey={replayKey}
                    />
                  </span>
                  {item.suffix ? (
                    <span className="text-[13px] text-slate-500">
                      {item.suffix}
                    </span>
                  ) : null}
                </div>
                {extra}
              </div>
            </Flex>
          </Skeleton>
        </Card>
      </Badge.Ribbon>
    </div>
  );
}
