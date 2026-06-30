class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {

        ListNode merged = null;
        ListNode head = null;

        while (list1 != null && list2 != null) {

            ListNode next;

            if (list1.val < list2.val) {
                next = new ListNode(list1.val);
                list1 = list1.next;
            } else {
                next = new ListNode(list2.val);
                list2 = list2.next;
            }

            // 🔥 FIRST NODE CASE (important fix)
            if (merged == null) {
                merged = next;
                head = merged;
            } else {
                merged.next = next;
                merged = merged.next;
            }
        }

        // attach remaining list1
        while (list1 != null) {
            ListNode next = new ListNode(list1.val);

            if (merged == null) {   // 🔥 safety again
                merged = next;
                head = merged;
            } else {
                merged.next = next;
                merged = merged.next;
            }

            list1 = list1.next;
        }

        // attach remaining list2
        while (list2 != null) {
            ListNode next = new ListNode(list2.val);

            if (merged == null) {
                merged = next;
                head = merged;
            } else {
                merged.next = next;
                merged = merged.next;
            }

            list2 = list2.next;
        }

        return head;
    }
}