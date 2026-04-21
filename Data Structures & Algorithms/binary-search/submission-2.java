class Solution {
    public int search(int[] nums, int target) {
        return searchDeep(nums, 0, nums.length - 1, target);
    }

    public int searchDeep(int[] nums, int left, int right, int target) {
        if (left > right) return -1;

        int mid = left + (right - left) / 2;

        if (nums[mid] == target) return mid;

        if (nums[mid] > target){
            return searchDeep(nums, left, mid - 1, target);
        } else {
            return searchDeep(nums, mid + 1, right, target);
        }
    }
}