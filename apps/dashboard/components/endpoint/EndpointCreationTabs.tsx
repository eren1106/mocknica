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
        { value: "custom", label: "Custom", content: <EndpointForm onSuccess={onSuccess} /> },
        { value: "create-by-schema", label: "Create by Schema", content: <EndpointBySchemaForm onSuccess={onSuccess} /> },
      ]}
    />
  )
}

export default EndpointCreationTabs