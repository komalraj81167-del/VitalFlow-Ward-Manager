from dataclasses import dataclass
from typing import Generic, List, Optional, TypeVar


T = TypeVar("T")


@dataclass
class HeapItem(Generic[T]):
    priority: float
    item: T


class MaxHeap(Generic[T]):
    """A simple max-heap for highest-priority-first scheduling."""

    def __init__(self) -> None:
        self._heap: List[HeapItem[T]] = []

    def __len__(self) -> int:
        return len(self._heap)

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    def push(self, item: T, priority: float) -> None:
        self._heap.append(HeapItem(priority=priority, item=item))
        self._sift_up(len(self._heap) - 1)

    def peek(self) -> Optional[HeapItem[T]]:
        if self.is_empty():
            return None
        return self._heap[0]

    def pop(self) -> Optional[HeapItem[T]]:
        if self.is_empty():
            return None

        if len(self._heap) == 1:
            return self._heap.pop()

        root = self._heap[0]
        self._heap[0] = self._heap.pop()
        self._sift_down(0)
        return root

    def _sift_up(self, index: int) -> None:
        while index > 0:
            parent = (index - 1) // 2
            if self._heap[parent].priority >= self._heap[index].priority:
                break
            self._heap[parent], self._heap[index] = (
                self._heap[index],
                self._heap[parent],
            )
            index = parent

    def _sift_down(self, index: int) -> None:
        size = len(self._heap)

        while True:
            left = 2 * index + 1
            right = 2 * index + 2
            largest = index

            if left < size and self._heap[left].priority > self._heap[largest].priority:
                largest = left

            if right < size and self._heap[right].priority > self._heap[largest].priority:
                largest = right

            if largest == index:
                break

            self._heap[index], self._heap[largest] = (
                self._heap[largest],
                self._heap[index],
            )
            index = largest
