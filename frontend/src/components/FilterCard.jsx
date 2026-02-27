import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'

const fitlerData = [
    {
        fitlerType: "Location",
        array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"]
    },
    {
        fitlerType: "Industry",
        array: ["Frontend Developer", "Backend Developer", "FullStack Developer"]
    },
    {
        fitlerType: "Salary",
        array: [
            { label: "1-5 LPA", min: 1, max: 5 },
            { label: "5-7 LPA", min: 5, max: 7 },
            { label: "7-12 LPA", min: 7, max: 12 }
        ]
    },
]

const FilterCard = () => {

    const dispatch = useDispatch()
    const [selectedValues, setSelectedValues] = useState({})
    const [openSections, setOpenSections] = useState({})

    const toggleSection = (index) => {
        setOpenSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    const changeHandler = (sectionIndex, value) => {

        let parsedValue = value

        // If salary section, convert string back to object
        if (fitlerData[sectionIndex].fitlerType === "Salary") {
            parsedValue = JSON.parse(value)
        }

        const newValues = {
            ...selectedValues,
            [sectionIndex]: parsedValue
        }

        setSelectedValues(newValues)
        dispatch(setSearchedQuery(newValues))
    }

    const clearFilters = () => {
        setSelectedValues({})
        dispatch(setSearchedQuery({}))
    }

    return (
        <div className='w-full bg-white p-3 rounded-md'>

            <div className='flex justify-between items-center'>
                <h1 className='font-bold text-lg'>Filter Jobs</h1>
                
            </div>

            <hr className='mt-3 mb-2' />

            {
                fitlerData.map((data, index) => (

                    <div key={index} className='mb-2 border-b pb-2'>

                        <div
                            className='cursor-pointer font-semibold py-2 flex justify-between items-center'
                            onClick={() => toggleSection(index)}
                        >
                            <span>{data.fitlerType}</span>
                            <span className={`transition-transform duration-200 ${openSections[index] ? "rotate-180" : ""}`}>
                                ▼
                            </span>
                        </div>

                        <div className={`overflow-hidden transition-all duration-200 ${
                            openSections[index]
                                ? "max-h-40 opacity-100"
                                : "max-h-0 opacity-0"
                        }`}>

                            <RadioGroup
                                value={
                                    data.fitlerType === "Salary"
                                        ? JSON.stringify(selectedValues[index] || "")
                                        : selectedValues[index] || ""
                                }
                                onValueChange={(value) => changeHandler(index, value)}
                            >
                                {
                                    data.array.map((item, idx) => {

                                        const isSalary = data.fitlerType === "Salary"
                                        const displayValue = isSalary ? item.label : item
                                        const radioValue = isSalary ? JSON.stringify(item) : item
                                        const itemId = `id${index}-${idx}`

                                        return (
                                            <div key={itemId} className='flex items-center space-x-2 my-2'>
                                                <RadioGroupItem
                                                    value={radioValue}
                                                    id={itemId}
                                                />
                                                <Label htmlFor={itemId}>
                                                    {displayValue}
                                                </Label>
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>

                        </div>

                    </div>
                ))
            }
<button
                    onClick={clearFilters}
                    className='text-sm text-red-500 hover:underline'
                >
                    No Filter
                </button>
        </div>
    )
}

export default FilterCard