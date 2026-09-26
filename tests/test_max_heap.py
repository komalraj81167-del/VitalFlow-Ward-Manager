from backend.algorithms.max_heap import MaxHeap


def test_max_heap_returns_highest_priority_first():
    heap = MaxHeap[str]()

    heap.push("PAT-LOW", 3.0)
    heap.push("PAT-CRITICAL", 9.4)
    heap.push("PAT-HIGH", 7.2)

    assert heap.pop().item == "PAT-CRITICAL"
    assert heap.pop().item == "PAT-HIGH"
    assert heap.pop().item == "PAT-LOW"


def test_max_heap_empty():
    heap = MaxHeap[str]()
    assert heap.pop() is None
    assert heap.peek() is None
