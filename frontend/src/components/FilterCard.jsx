import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import { ChevronDown, Filter, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    const [openSections, setOpenSections] = useState({ 0: true, 1: true, 2: true })

    const toggleSection = (index) => {
        setOpenSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    const changeHandler = (sectionIndex, value) => {
        let parsedValue = value
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

    const hasFilters = Object.keys(selectedValues).length > 0;

    return (
        <div className='w-full bg-white p-6 rounded-3xl border border-border/50 shadow-sm'>
            <div className='flex justify-between items-center mb-6'>
                <div className='flex items-center gap-2'>
                    <div className='p-2 bg-primary/10 text-primary rounded-lg'>
                        <Filter size={18} />
                    </div>
                    <h1 className='font-bold text-xl'>Filters</h1>
                </div>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className='text-xs font-bold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1'
                    >
                        <X size={14} />
                        Reset
                    </button>
                )}
            </div>

            <div className='space-y-4'>
                {fitlerData.map((data, index) => (
                    <div key={index} className='border-b border-border/40 pb-4 last:border-none last:pb-0'>
                        <button
                            className='w-full flex justify-between items-center py-2 group'
                            onClick={() => toggleSection(index)}
                        >
                            <span className='font-bold text-sm text-foreground group-hover:text-primary transition-colors uppercase tracking-wider'>
                                {data.fitlerType}
                            </span>
                            <motion.div
                                animate={{ rotate: openSections[index] ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className='text-muted-foreground group-hover:text-primary transition-colors'
                            >
                                <ChevronDown size={18} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {openSections[index] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className='overflow-hidden'
                                >
                                    <RadioGroup
                                        className="pt-2 space-y-3"
                                        value={
                                            data.fitlerType === "Salary"
                                                ? JSON.stringify(selectedValues[index] || "")
                                                : selectedValues[index] || ""
                                        }
                                        onValueChange={(value) => changeHandler(index, value)}
                                    >
                                        {data.array.map((item, idx) => {
                                            const isSalary = data.fitlerType === "Salary"
                                            const displayValue = isSalary ? item.label : item
                                            const radioValue = isSalary ? JSON.stringify(item) : item
                                            const itemId = `id${index}-${idx}`
                                            const isSelected = (data.fitlerType === "Salary" 
                                                ? JSON.stringify(selectedValues[index]) === radioValue 
                                                : selectedValues[index] === radioValue)

                                            return (
                                                <div key={itemId} className='flex items-center space-x-3 group/item'>
                                                    <RadioGroupItem
                                                        value={radioValue}
                                                        id={itemId}
                                                        className="border-border text-primary focus:ring-primary h-4 w-4"
                                                    />
                                                    <Label 
                                                        htmlFor={itemId} 
                                                        className={`text-sm font-medium cursor-pointer transition-colors ${isSelected ? 'text-primary font-bold' : 'text-muted-foreground group-hover/item:text-foreground'}`}
                                                    >
                                                        {displayValue}
                                                    </Label>
                                                </div>
                                            )
                                        })}
                                    </RadioGroup>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FilterCard