class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> result = new HashMap<Integer, Integer>();
        for (int i = 0; i < nums.length; i++) {
            int missing = target - nums[i];
            if (result.containsKey(missing)) {
                return new int[]{result.get(missing), i};
            }
            result.put(nums[i], i);
        }
        return new int[]{};
    }
}
