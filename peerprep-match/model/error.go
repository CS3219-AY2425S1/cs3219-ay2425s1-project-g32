package model

type InvalidInputError struct {
	Message string
}

func (e InvalidInputError) Error() string {
	return e.Message
}
