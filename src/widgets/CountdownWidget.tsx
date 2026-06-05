import { Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

type CountdownWidgetProps = {
  name: string;
  emoji: string;
  daysRemaining: number;
};

const CountdownWidgetComponent = (
  props: CountdownWidgetProps,
  _environment: WidgetEnvironment,
) => {
  "widget";

  const daysText =
    props.daysRemaining === 0
      ? "Today!"
      : props.daysRemaining === 1
        ? "1 day"
        : `${props.daysRemaining} days`;

  return (
    <VStack modifiers={[padding({ all: 12 })]}>
      <Text modifiers={[font({ size: 32 })]}>{props.emoji}</Text>
      <Text
        modifiers={[
          font({ weight: "semibold", size: 14 }),
          foregroundStyle("#1C1C1E"),
        ]}
      >
        {props.name}
      </Text>
      <Text
        modifiers={[
          font({ weight: "bold", size: 20 }),
          foregroundStyle("#208AEF"),
        ]}
      >
        {daysText}
      </Text>
      <Text modifiers={[font({ size: 11 }), foregroundStyle("#8E8E93")]}>
        remaining
      </Text>
    </VStack>
  );
};

const CountdownWidget = createWidget(
  "CountdownWidget",
  CountdownWidgetComponent,
);
export default CountdownWidget;
