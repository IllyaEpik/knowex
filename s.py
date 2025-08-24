main = ["1", "2", "3"]
l1 = ["3", "2", "1", "1", '3']
l2 = ["2", "1", "4"]

main_set = set(main)
l1_set = set(l1)
l2_set = set(l2)
print(l1_set,l1)
# Check if l1_set contains all elements of main_set
check_l1 = main_set.issuperset(l1_set)
print(check_l1,len(main) == len(l1))  # Output: True

# Check if l2_set contains all elements of main_set
check_l2 = l2_set.issuperset(main_set)
print(check_l2)  # Output: False
print("12" in ['12','32'])