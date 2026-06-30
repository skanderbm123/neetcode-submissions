class Solution {
    public boolean hasCycle(ListNode head) {
        if (head == null) return false;

        ListNode pointer1 = head;
        ListNode pointer2 = head;

        while (pointer2 != null && pointer2.next != null) {

            pointer1 = pointer1.next;
            pointer2 = pointer2.next.next;

            if (pointer1 == pointer2) {
                return true;
            }
        }

        return false;
    }
}