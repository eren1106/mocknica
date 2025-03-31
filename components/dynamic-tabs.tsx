import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface TabData {
  value: string;
  label: string | ReactNode;
  content: ReactNode;
}

interface DynamicTabsProps {
  tabs: TabData[];
  defaultValue?: string;
  tabListClassName?: string;
  tabClassName?: string;
  className?: string;
}

const getGridColsClass = (cols: number): string => {
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    case 5:
      return "grid-cols-5";
    case 6:
      return "grid-cols-6";
    // Add more cases as needed
    default:
      return "";
  }
};

const DynamicTabs = (props: DynamicTabsProps) => {
  if(props.tabs.length < 1) return <></>;
  
  const gridColsClass = getGridColsClass(props.tabs.length);

  return (
    <Tabs defaultValue={props.defaultValue || props.tabs[0]?.value} className={cn("w-full", props.className)}>
      <TabsList className={cn("grid", gridColsClass, props.tabListClassName)}>
        {props.tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className={props.tabClassName}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {props.tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default DynamicTabs