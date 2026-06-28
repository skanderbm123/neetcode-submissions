class Solution {
    public int[] twoSum(int[] nums, int target) {
      HashMap<Integer,Integer> location = new HashMap<>();
      int remainder;

      for (int i=0; i < nums.length; i++){
        remainder = target - nums[i];
        if (location.containsKey(remainder)){
            return new int[]{location.get(remainder), i};
        }
        location.put(nums[i], i);
      }

    return new int[]{};
    }
}
