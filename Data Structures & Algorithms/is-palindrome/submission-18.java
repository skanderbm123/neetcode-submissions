class Solution {
     public boolean isPalindrome(String s) {
        int start = 0;
        int end = s.length() - 1;

        while (start < end) {

            while (start < end && !isAlphanumeric(s.charAt(start))) {
                start++;
            }

            while (start < end && !isAlphanumeric(s.charAt(end))) {
                end--;
            }

            char left = Character.toLowerCase(s.charAt(start));
            char right = Character.toLowerCase(s.charAt(end));

            if (left != right) {
                return false;
            }

            // Move the pointers after a successful comparison
            start++;
            end--;
        }

        return true;
    }

    public boolean isAlphanumeric (char c) {
        return Character.isLetter(c) || Character.isDigit(c);
    }
}
