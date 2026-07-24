from abc import ABC, abstractmethod
from typing import Dict, Any, List

class IAIProvider(ABC):
    """
    Interface for AI operations (Triage, Drafts).
    """
    @abstractmethod
    def triage_ticket(self, title: str, body: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def draft_response(
        self, 
        ticket_title: str, 
        ticket_category: str, 
        messages: List[Dict[str, str]]
    ) -> Dict[str, str]:
        pass
