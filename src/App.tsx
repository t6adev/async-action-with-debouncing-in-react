import { useState, useCallback, useRef } from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  Container,
  Heading,
  Text,
  OrderedList,
  ListItem,
  Spinner
} from "@chakra-ui/react";
import { CheckIcon, WarningTwoIcon } from "@chakra-ui/icons";

const Succeed = () => <CheckIcon color="green.500" />;
const Failed = () => <WarningTwoIcon color="yellow.500" />;

const Description = () => (
  <>
    <Heading mb={4}>Async action with debouncing</Heading>
    <Text mb={4}>
      The right side of this {`<Input />`} shows a status which is changed by
      inputting and a result of async function with debouncing.
    </Text>
    <Text>The status has 4 modes with icons.</Text>
    <OrderedList p={2}>
      <ListItem>neutral : (blank)</ListItem>
      <ListItem>canceling : ... , it's shown while you inputting</ListItem>
      <ListItem>
        processing : <Spinner size="xs" /> , it's shown while the async function
        running
      </ListItem>
      <ListItem>
        done : <Succeed /> or <Failed /> , which are based on the function
        result
      </ListItem>
    </OrderedList>
  </>
);

const getRightElement = (mode: string, result?: boolean) => {
  if (mode === "processing") return <Spinner />;
  if (mode === "done" && result) return <Succeed />;
  if (mode === "done" && !result) return <Failed />;
  if (mode === "canceling") return "...";
  if (mode === "neutral") return null;
};

const InputWithAsyncAction = ({
  defaultValue,
  onAction,
  mode,
  result
}: {
  defaultValue: string;
  onAction: (str: string) => void;
  mode: string;
  result?: boolean;
}) => {
  const [val, setVal] = useState(defaultValue);

  return (
    <InputGroup>
      <Input
        value={val}
        onChange={(e) => {
          const input = e.target.value;
          setVal(input);
          onAction(input);
        }}
      />
      <InputRightElement children={getRightElement(mode, result)} />
    </InputGroup>
  );
};

type Status = {
  mode: "neutral" | "canceling" | "processing" | "done";
  result?: boolean;
};
type TimerRef = {
  createdAt: number;
  timer: ReturnType<typeof setTimeout>;
};

const useAsyncAction = (
  actualAction: () => Promise<boolean>,
  debounce = 2000
) => {
  const [status, setStatus] = useState<Status>({ mode: "neutral" });
  const timerRef = useRef<TimerRef | null>(null);
  const action = useCallback(
    (val: string) =>
      new Promise((r) => {
        const createdAt = Date.now();
        if (
          timerRef.current &&
          timerRef.current.createdAt + debounce > createdAt
        ) {
          clearTimeout(timerRef.current.timer);
          setStatus({ mode: "canceling" });
        }
        if (val) {
          const timer = setTimeout(async () => {
            setStatus({ mode: "processing" });
            const result = await actualAction();
            console.log(val, result);
            setStatus({ mode: "done", result });
            if (result) {
              setTimeout(() => setStatus({ mode: "neutral" }), 1000);
            }
          }, debounce);
          timerRef.current = { createdAt, timer };
        } else {
          setStatus({ mode: "neutral" });
        }
      }),
    [debounce, actualAction]
  );
  return [status, action] as const;
};

export const App = () => {
  const actualAction = useCallback(
    (): Promise<boolean> =>
      new Promise((r) => setTimeout(() => r(Math.random() > 0.5), 1000)),
    []
  );
  const [{ mode, result }, action] = useAsyncAction(actualAction, 1500);
  return (
    <Container py={32}>
      <Description />
      <InputWithAsyncAction
        defaultValue="default value"
        onAction={action}
        mode={mode}
        result={result}
      />
    </Container>
  );
};
