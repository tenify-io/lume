package kube

func ptrInt32(i int32) *int32 { return &i }
func ptrInt64(i int64) *int64 { return &i }
func ptrBool(b bool) *bool    { return &b }
