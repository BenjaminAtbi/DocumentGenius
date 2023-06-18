
from time import perf_counter
from langchain.callbacks.base import *

class perftimer():

    def __init__(self):
        self.timepoints = []
        self.ref_time = None

    def initialize(self):
        self.timepoints = []
        self.ref_time = perf_counter()
        print(f"timepoint 0 - start")
        self.timepoints.append("0 - start")

    def timepoint(self, label):
        current_time = perf_counter()
        elapsed_time = current_time - self.ref_time
        self.ref_time = current_time

        timepoint = f"{elapsed_time:0.2f} - {label}"
        print(timepoint)
        self.timepoints.append(timepoint)

    def conclude(self, label):
        self.timepoint(label)
        print("list of timepoints:")
        for timepoint in self.timepoints:
            print(timepoint)

    def dumptimepoints(self):
        return self.timepoints

    async def time_response(self, response):
        self.timepoint(response)
    
class TimerCallbackHandler(BaseCallbackHandler):
    """Callback Handler that adds timepoint."""

    def __init__(self, timer) -> None:
        """Initialize callback handler."""
        self.timer = timer

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> None:
        """Print out the prompts."""
        self.timer.timepoint("on llm start")

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """Do nothing."""
        self.timer.timepoint("on llm end")

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        """Do nothing."""
        self.timer.timepoint("on llm new token")

    def on_llm_error(
        self, error: Union[Exception, KeyboardInterrupt], **kwargs: Any
    ) -> None:
        """Do nothing."""
        self.timer.timepoint("on llm error")

    def on_chain_start(
        self, serialized: Dict[str, Any], inputs: Dict[str, Any], **kwargs: Any
    ) -> None:
        """Print out that we are entering a chain."""
        class_name = serialized.get("name", "")
        self.timer.timepoint(f"\n\n\033[1m> Entering new {class_name} chain...\033[0m")

    def on_chain_end(self, outputs: Dict[str, Any], **kwargs: Any) -> None:
        """Print out that we finished a chain."""
        self.timer.timepoint("\n\033[1m> Finished chain.\033[0m")

    def on_chain_error(
        self, error: Union[Exception, KeyboardInterrupt], **kwargs: Any
    ) -> None:
        """Do nothing."""
        self.timer.timepoint("on chain error")

    def on_tool_start(
        self,
        serialized: Dict[str, Any],
        input_str: str,
        **kwargs: Any,
    ) -> None:
        """Do nothing."""
        self.timer.timepoint("on tool start")

    def on_agent_action(
        self, action: AgentAction, color: Optional[str] = None, **kwargs: Any
    ) -> Any:
        """Run on agent action."""
        self.timer.timepoint("on agent action: {action.log}")

    def on_tool_end(
        self,
        output: str,
        color: Optional[str] = None,
        observation_prefix: Optional[str] = None,
        llm_prefix: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        """If not the final action, print out observation."""
        if observation_prefix is not None:
            self.timer.timepoint(f"\n{observation_prefix}")
        self.timer.timepoint(output)
        if llm_prefix is not None:
            self.timer.timepoint(f"\n{llm_prefix}")

    def on_tool_error(
        self, error: Union[Exception, KeyboardInterrupt], **kwargs: Any
    ) -> None:
        """Do nothing."""
        self.timer.timepoint("on tool error")

    def on_text(
        self,
        text: str,
        color: Optional[str] = None,
        end: str = "",
        **kwargs: Any,
    ) -> None:
        """Run when agent ends."""
        self.timer.timepoint(text)

    def on_agent_finish(
        self, finish: AgentFinish, color: Optional[str] = None, **kwargs: Any
    ) -> None:
        """Run on agent end."""
        self.timer.timepoint(finish.log)