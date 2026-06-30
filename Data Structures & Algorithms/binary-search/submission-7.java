class Solution {
    public int search(int[] nums, int target) {
        return searching(nums, 0, nums.length - 1, target);
    }

    public int searching(int[] nums, int start, int end, int target) {
        if (start > end) {
            return -1;
        }

        int middle = start + (end - start) / 2;

        if (nums[middle] == target) {
            return middle;
        }

        // Left half is sorted
        if (nums[start] <= nums[middle]) {

            // Target is inside the left half
            if (target >= nums[start] && target < nums[middle]) {
                return searching(nums, start, middle - 1, target);
            } else {
                return searching(nums, middle + 1, end, target);
            }

        }
        // Right half is sorted
        else {

            // Target is inside the right half
            if (target > nums[middle] && target <= nums[end]) {
                return searching(nums, middle + 1, end, target);
            } else {
                return searching(nums, start, middle - 1, target);
            }
        }
    }
}
























