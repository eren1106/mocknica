import DynamicTabs from "../dynamic-tabs"
import EndpointBySchemaForm from "./EndpointBySchemaForm";
import EndpointForm from "./EndpointForm"

interface EndpointCreationTabsProps {
  onSuccess: () => void;
}

const EndpointCreationTabs = ({ onSuccess }: EndpointCreationTabsProps) => {
  return (
    <DynamicTabs
      tabs={[
        { value: "1", label: "Create by Schema", content: <EndpointBySchemaForm onSuccess={onSuccess} /> },
        { value: "2", label: "Custom", content: <EndpointForm onSuccess={onSuccess} /> },
      ]}
    />
  )
}

export default EndpointCreationTabs