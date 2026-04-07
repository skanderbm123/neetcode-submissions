class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // Step 1: count frequencies
        Map<Integer, Integer> count = new HashMap<>();
        for (int num : nums) {
            count.put(num, count.getOrDefault(num, 0) + 1);
        }

        // Step 2: use a min-heap (PriorityQueue) to track top k
        PriorityQueue<Map.Entry<Integer, Integer>> heap =
            new PriorityQueue<>((a, b) -> a.getValue() - b.getValue()); // min-heap by frequency

        // Step 3: iterate through the map
        for (Map.Entry<Integer, Integer> entry : count.entrySet()) {
            heap.add(entry);                 // add current entry
            if (heap.size() > k) {           // keep only top k
                heap.poll();                 // remove smallest frequency
            }
        }

        // Step 4: extract results into an int array
        int[] arr = new int[k];
        int i = 0;
        while (!heap.isEmpty()) {
            arr[i++] = heap.poll().getKey(); // take the number
        }

        return arr; // top k frequent numbers
    }
}